"""Conversion DOCX vers PDF via l'API CloudConvert.

Les identifiants CloudConvert sont lus uniquement depuis les variables
d'environnement. Aucun fichier n'est envoyé depuis le navigateur.
"""

from __future__ import annotations

import os
import time
from pathlib import Path

import requests


API_BASE_URL = "https://api.cloudconvert.com/v2"


class CloudConvertError(RuntimeError):
    """Erreur générique de conversion CloudConvert."""


class CloudConvertConfigurationError(CloudConvertError):
    """Configuration absente ou service désactivé."""


class CloudConvertQuotaError(CloudConvertError):
    """Quota ou crédit CloudConvert indisponible."""


class CloudConvertTimeoutError(CloudConvertError):
    """Le job CloudConvert n'est pas terminé dans le délai prévu."""


def _configuration():
    enabled = os.getenv("CLOUDCONVERT_ENABLED", "true").strip().lower()
    if enabled not in {"1", "true", "yes", "on"}:
        raise CloudConvertConfigurationError(
            "La conversion CloudConvert est désactivée dans la configuration."
        )

    configured_keys = os.getenv("CLOUDCONVERT_API_KEYS", "")
    api_keys = [key.strip() for key in configured_keys.split(",") if key.strip()]
    if not api_keys:
        single_key = os.getenv("CLOUDCONVERT_API_KEY", "").strip()
        if single_key:
            api_keys = [single_key]
    if not api_keys:
        raise CloudConvertConfigurationError(
            "Aucune clé CloudConvert n'est configurée sur le serveur."
        )

    try:
        timeout = max(10, int(os.getenv("CLOUDCONVERT_TIMEOUT", "180")))
    except ValueError:
        timeout = 180
    return api_keys, timeout


def _request(method, url, api_key, **kwargs):
    headers = kwargs.pop("headers", {})
    headers["Authorization"] = f"Bearer {api_key}"
    headers.setdefault("Accept", "application/json")
    try:
        response = requests.request(method, url, headers=headers, **kwargs)
    except requests.RequestException as error:
        raise CloudConvertError(
            "CloudConvert est momentanément inaccessible."
        ) from error

    if response.status_code in {402, 429}:
        raise CloudConvertQuotaError(
            "Le quota CloudConvert est épuisé ou la limite de conversion a été atteinte."
        )
    if response.status_code in {401, 403}:
        raise CloudConvertConfigurationError(
            "La clé CloudConvert est invalide ou n'est pas autorisée."
        )
    if response.status_code >= 400:
        raise CloudConvertError(
            f"CloudConvert a refusé la conversion (HTTP {response.status_code})."
        )
    return response


def _json(response):
    try:
        return response.json()
    except ValueError as error:
        raise CloudConvertError("Réponse CloudConvert invalide.") from error


def _task(job, name):
    for task in job.get("data", {}).get("tasks", []):
        if task.get("name") == name:
            return task
    return None


def _job_status(job):
    status = job.get("data", {}).get("status")
    if status:
        return status
    tasks = job.get("data", {}).get("tasks", [])
    statuses = {task.get("status") for task in tasks}
    if "error" in statuses:
        return "error"
    if statuses and statuses.issubset({"finished"}):
        return "finished"
    return "processing"


def _job_failure_message(job):
    """Retourne un détail CloudConvert exploitable sans exposer la clé API."""
    for task in job.get("data", {}).get("tasks", []):
        if task.get("status") not in {"error", "failed"}:
            continue
        result = task.get("result") or {}
        message = result.get("message") or task.get("message")
        code = result.get("code") or task.get("code")
        if message and code:
            return f"{code}: {message}"
        if message:
            return str(message)
        if code:
            return str(code)
    return "motif non communiqué"


def _convert_word_to_pdf_with_key(word_path, pdf_path, api_key, timeout):
    """Convertit un DOCX en PDF et télécharge le résultat localement."""
    source = Path(word_path).resolve()
    if not source.is_file():
        raise FileNotFoundError(f"Convocation Word introuvable : {source}")

    destination = Path(pdf_path or source.with_suffix(".pdf")).resolve()
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary_destination = destination.with_name(f".{destination.name}.tmp")
    if temporary_destination.exists():
        temporary_destination.unlink()

    job_payload = {
        "tasks": {
            "upload-source": {"operation": "import/upload"},
            "convert-to-pdf": {
                "operation": "convert",
                "input": "upload-source",
                "input_format": "docx",
                "output_format": "pdf",
            },
            "export-pdf": {
                "operation": "export/url",
                "input": "convert-to-pdf",
                "inline": False,
            },
        }
    }

    created_job = _request(
        "POST", f"{API_BASE_URL}/jobs", api_key, json=job_payload, timeout=30
    )
    job = _json(created_job)
    job_id = job.get("data", {}).get("id")
    if not job_id:
        raise CloudConvertError("CloudConvert n'a pas retourné d'identifiant de job.")

    upload_task = _task(job, "upload-source")
    form = upload_task.get("result", {}).get("form", {}) if upload_task else {}
    upload_url = form.get("url")
    upload_parameters = form.get("parameters", {})
    if not upload_url:
        raise CloudConvertError("CloudConvert n'a pas fourni de destination d'envoi.")

    try:
        try:
            with source.open("rb") as source_stream:
                upload_response = requests.post(
                    upload_url,
                    data=upload_parameters,
                    files={
                        "file": (
                            source.name,
                            source_stream,
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        )
                    },
                    timeout=60,
                )
        except requests.RequestException as error:
            raise CloudConvertError("L'envoi du document vers CloudConvert a échoué.") from error
        if upload_response.status_code >= 400:
            raise CloudConvertError("CloudConvert n'a pas accepté le document Word.")

        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            current = _json(_request("GET", f"{API_BASE_URL}/jobs/{job_id}", api_key, timeout=30))
            status = _job_status(current)
            if status == "finished":
                job = current
                break
            if status in {"error", "failed"}:
                detail = _job_failure_message(current)
                raise CloudConvertError(
                    f"CloudConvert n'a pas pu convertir le document Word ({detail})."
                )
            time.sleep(2)
        else:
            raise CloudConvertTimeoutError(
                f"La conversion CloudConvert a dépassé {timeout} secondes."
            )

        export_task = _task(job, "export-pdf")
        files = export_task.get("result", {}).get("files", []) if export_task else []
        download_url = files[0].get("url") if files else None
        if not download_url:
            raise CloudConvertError("CloudConvert n'a pas fourni le PDF converti.")

        try:
            pdf_response = requests.get(download_url, timeout=60)
        except requests.RequestException as error:
            raise CloudConvertError("Le téléchargement du PDF CloudConvert a échoué.") from error
        if pdf_response.status_code >= 400 or not pdf_response.content.startswith(b"%PDF"):
            raise CloudConvertError("Le fichier reçu depuis CloudConvert n'est pas un PDF valide.")

        temporary_destination.write_bytes(pdf_response.content)
        temporary_destination.replace(destination)
        return destination
    finally:
        # Les URLs exportées sont temporaires ; on supprime aussi le job si l'API l'autorise.
        try:
            requests.delete(f"{API_BASE_URL}/jobs/{job_id}", headers={"Authorization": f"Bearer {api_key}"}, timeout=15)
        except requests.RequestException:
            pass
        if temporary_destination.exists():
            temporary_destination.unlink()


def convert_word_to_pdf_cloudconvert(word_path, pdf_path=None):
    """Convertit un DOCX en PDF avec basculement sur quota épuisé."""
    api_keys, timeout = _configuration()
    last_quota_error = None
    for api_key in api_keys:
        try:
            return _convert_word_to_pdf_with_key(word_path, pdf_path, api_key, timeout)
        except CloudConvertQuotaError as error:
            last_quota_error = error
            continue
    if last_quota_error:
        raise last_quota_error
    raise CloudConvertError("Aucune clé CloudConvert disponible pour la conversion.")
