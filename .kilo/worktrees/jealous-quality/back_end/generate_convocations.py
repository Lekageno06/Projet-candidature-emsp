"""Génération des convocations EMSP à partir du modèle Word officiel."""

import os
from datetime import date
from pathlib import Path

from docx import Document

from cloudconvert_pdf import (
    CloudConvertConfigurationError,
    CloudConvertError,
    CloudConvertQuotaError,
    CloudConvertTimeoutError,
    convert_word_to_pdf_cloudconvert,
)


ROOT_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = ROOT_DIR / "front-end" / "model"
TEMPLATE_PATH = MODEL_DIR / "modele Convocation_EMSP_Composition_Admission_2026.docx"


def _paragraphs(container):
    for paragraph in getattr(container, "paragraphs", []):
        yield paragraph
    for table in getattr(container, "tables", []):
        for row in table.rows:
            for cell in row.cells:
                yield from _paragraphs(cell)


def _replace_placeholders(document, values):
    for paragraph in _paragraphs(document):
        original = paragraph.text
        replacement = original
        for key, value in values.items():
            replacement = replacement.replace("{{ " + key + " }}", str(value))
            replacement = replacement.replace("{{" + key + "}}", str(value))
        if replacement == original:
            continue
        if len(paragraph.runs) == 1:
            paragraph.runs[0].text = replacement
        else:
            paragraph.text = replacement


def _pdf_escape(value):
    value = str(value).replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
    return value.encode("latin-1", "replace").decode("latin-1")


def _write_pdf(document, output_path):
    """Crée un PDF autonome à partir du contenu final du modèle rempli."""
    lines = []
    seen_paragraphs = set()
    for paragraph in _paragraphs(document):
        paragraph_key = paragraph._p
        if paragraph_key in seen_paragraphs:
            continue
        seen_paragraphs.add(paragraph_key)
        text = " ".join(paragraph.text.split())
        if text:
            lines.append(text)
    if not lines:
        lines = ["Convocation EMSP - Admission 2026"]

    pages = [lines[index:index + 42] for index in range(0, len(lines), 42)]
    page_count = len(pages)
    objects = ["<< /Type /Catalog /Pages 2 0 R >>"]
    page_ids = [3 + index * 2 for index in range(page_count)]
    content_ids = [4 + index * 2 for index in range(page_count)]
    kids = " ".join(f"{page_id} 0 R" for page_id in page_ids)
    objects.append(f"<< /Type /Pages /Kids [{kids}] /Count {page_count} >>")

    for page_index, page_lines in enumerate(pages):
        content_id = content_ids[page_index]
        objects.append(
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
            f"/Resources << /Font << /F1 {2 + page_count * 2 + 1} 0 R >> >> "
            f"/Contents {content_id} 0 R >>"
        )
        commands = ["BT", "/F1 10 Tf", "50 790 Td", "14 TL"]
        for line in page_lines:
            commands.extend([f"({_pdf_escape(line)}) Tj", "0 -1 Td"])
        commands.append("ET")
        stream = "\n".join(commands).encode("cp1252", "replace")
        objects.append(f"<< /Length {len(stream)} >>\nstream\n{stream.decode('cp1252')}\nendstream")
    objects.append(
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica "
        "/Encoding /WinAnsiEncoding >>"
    )

    result = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]
    for object_number, object_value in enumerate(objects, start=1):
        offsets.append(len(result))
        result.extend(f"{object_number} 0 obj\n".encode("ascii"))
        result.extend(object_value.encode("cp1252", "replace"))
        result.extend(b"\nendobj\n")
    xref_offset = len(result)
    result.extend(f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode("ascii"))
    for offset in offsets[1:]:
        result.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    result.extend(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
        f"startxref\n{xref_offset}\n%%EOF\n".encode("ascii")
    )
    output_path.write_bytes(result)


def _display(value, default="À préciser"):
    if value is None or str(value).strip() == "":
        return default
    if hasattr(value, "strftime"):
        return value.strftime("%d/%m/%Y")
    if isinstance(value, str):
        try:
            return date.fromisoformat(value).strftime("%d/%m/%Y")
        except ValueError:
            pass
    return str(value)


def generate_all_convocations(connection, upload_folder, template_path=TEMPLATE_PATH):
    """Génère une convocation Word pour chaque dossier validé.

    La fonction met aussi à jour les métadonnées de document pour rendre les
    convocations téléchargeables depuis le dashboard et l’espace candidat.
    """
    if not Path(template_path).is_file():
        raise FileNotFoundError(f"Modèle introuvable : {template_path}")

    cursor = connection.cursor(dictionary=True)
    cursor.execute(
        "SELECT setting_key, setting_value FROM platform_setting "
        "WHERE setting_key IN ('composition_date', 'composition_centre')"
    )
    settings = {row["setting_key"]: row["setting_value"] for row in cursor.fetchall() or []}
    composition_date = settings.get("composition_date") or os.getenv("COMPOSITION_DATE", "À définir")
    composition_centre = settings.get("composition_centre") or os.getenv("COMPOSITION_CENTRE", "À définir")
    cursor.execute(
        "SELECT * FROM candidature WHERE dossier_valide = 1 "
        "ORDER BY numero_dossier"
    )
    candidates = cursor.fetchall() or []
    generated = []
    errors = []
    output_root = Path(upload_folder).resolve()
    output_root.mkdir(parents=True, exist_ok=True)

    for candidate in candidates:
        dossier = candidate["numero_dossier"]
        try:
            values = {
                "dossier": _display(dossier),
                "code_tresor_pay": _display(candidate.get("code_tresor_pay")),
                "nom": _display(candidate.get("nom")),
                "prenoms": _display(candidate.get("prenoms")),
                "date_naissance": _display(candidate.get("date_naissance")),
                "lieu_naissance": _display(candidate.get("lieu_naissance")),
                "serie_bac": _display(candidate.get("serie_bac")),
                "telephone": _display(candidate.get("telephone")),
                "choix1": _display(candidate.get("choix_1_filiere")),
                "choix2": _display(candidate.get("choix_2_filiere")),
                "date_composition": _display(
                    composition_date or candidate.get("date_compo"), "À définir"
                ),
                "heure": os.getenv("COMPOSITION_HEURE", "08h00"),
                "centre": _display(
                    composition_centre or candidate.get("centre_compo"), "À définir"
                ),
                "salle": os.getenv("COMPOSITION_SALLE", "À préciser"),
                "date_emission": date.today().strftime("%d/%m/%Y"),
            }
            document = Document(str(template_path))
            _replace_placeholders(document, values)
            dossier_dir = output_root / dossier
            dossier_dir.mkdir(parents=True, exist_ok=True)
            pdf_filename = "convocation_admission_2026.pdf"
            pdf_path = dossier_dir / pdf_filename
            # CloudConvert refuse certains noms de fichiers commençant par un
            # point ; le suffixe source garde le DOCX temporaire hors du flux
            # de téléchargement sans masquer son extension .docx.
            temporary_docx = dossier_dir / "convocation_admission_2026_source.docx"
            document.save(str(temporary_docx))
            try:
                convert_word_to_pdf_cloudconvert(temporary_docx, pdf_path)
            finally:
                if temporary_docx.exists():
                    temporary_docx.unlink()
            relative_path = f"{dossier}/{pdf_filename}"
            cursor.execute(
                "INSERT INTO candidature_document "
                "(numero_dossier, type_document, nom_fichier, chemin_fichier) "
                "VALUES (%s, 'convocation', %s, %s) "
                "ON DUPLICATE KEY UPDATE nom_fichier=VALUES(nom_fichier), "
                "chemin_fichier=VALUES(chemin_fichier)",
                (dossier, pdf_filename, relative_path),
            )
            generated.append(dossier)
        except (CloudConvertConfigurationError, CloudConvertQuotaError, CloudConvertTimeoutError):
            # Ces erreurs concernent toute la génération : inutile de relancer
            # le même appel pour chaque candidat validé.
            raise
        except CloudConvertError as error:  # pragma: no cover - reported to admin
            errors.append({"dossier": dossier, "error": str(error)})
        except Exception as error:  # pragma: no cover - reported to admin
            errors.append({"dossier": dossier, "error": str(error)})

    connection.commit()
    cursor.close()
    return {"generated": generated, "errors": errors, "total_valides": len(candidates)}


if __name__ == "__main__":
    import sys

    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from app import get_connection

    connection = get_connection()
    try:
        result = generate_all_convocations(connection, ROOT_DIR / "back-end" / "uploads")
        print(result)
    finally:
        connection.close()
