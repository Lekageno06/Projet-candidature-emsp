"""Conversion fidèle des convocations DOCX en PDF sans Microsoft Word."""

import shutil
import subprocess
from pathlib import Path


def _find_soffice():
    candidates = [
        shutil.which("soffice"),
        shutil.which("libreoffice"),
        Path("C:/Program Files/LibreOffice/program/soffice.exe"),
        Path("C:/Program Files (x86)/LibreOffice/program/soffice.exe"),
    ]
    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            return str(candidate)
    return None


def convert_word_to_pdf(word_path, pdf_path=None):
    """Convertit un DOCX en conservant sa mise en page grâce à LibreOffice."""
    word_path = Path(word_path).resolve()
    if not word_path.is_file():
        raise FileNotFoundError(f"Convocation Word introuvable : {word_path}")

    soffice = _find_soffice()
    if not soffice:
        raise RuntimeError(
            "La conversion fidèle nécessite LibreOffice. "
            "Installez LibreOffice puis redémarrez le serveur."
        )

    requested_pdf = Path(pdf_path or word_path.with_suffix(".pdf")).resolve()
    requested_pdf.parent.mkdir(parents=True, exist_ok=True)
    generated_pdf = requested_pdf.parent / f"{word_path.stem}.pdf"
    if generated_pdf.exists():
        generated_pdf.unlink()

    command = [
        soffice,
        "--headless",
        "--convert-to", "pdf",
        "--outdir", str(requested_pdf.parent),
        str(word_path),
    ]
    try:
        result = subprocess.run(
            command, capture_output=True, text=True, timeout=90, check=False,
        )
    except subprocess.TimeoutExpired as error:
        raise RuntimeError("La conversion LibreOffice a dépassé 90 secondes.") from error

    if result.returncode != 0 or not generated_pdf.is_file():
        detail = (result.stderr or result.stdout).strip()
        raise RuntimeError(f"Conversion DOCX vers PDF impossible : {detail}")

    if generated_pdf != requested_pdf:
        if requested_pdf.exists():
            requested_pdf.unlink()
        generated_pdf.replace(requested_pdf)
    return requested_pdf


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Convertit une convocation DOCX en PDF.")
    parser.add_argument("word", type=Path, help="Chemin du fichier DOCX")
    parser.add_argument("--pdf", type=Path, help="Chemin de sortie PDF")
    arguments = parser.parse_args()
    print(convert_word_to_pdf(arguments.word, arguments.pdf))
