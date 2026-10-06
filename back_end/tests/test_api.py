import io
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import app as api
from werkzeug.security import generate_password_hash


class FakeCursor:
    def __init__(self, candidate=None):
        self.candidate = candidate
        self.executed = []
        self.closed = False

    def execute(self, query, values=None):
        self.executed.append((query, values))

    def fetchone(self):
        return self.candidate

    def close(self):
        self.closed = True


class FakeConnection:
    def __init__(self, candidate=None):
        self.fake_cursor = FakeCursor(candidate)
        self.committed = False
        self.rolled_back = False
        self.closed = False

    def cursor(self, **kwargs):
        return self.fake_cursor

    def commit(self):
        self.committed = True

    def rollback(self):
        self.rolled_back = True

    def close(self):
        self.closed = True


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.connection = FakeConnection()
        self.app = api.create_app({
            "TESTING": True,
            "SECRET_KEY": "test-secret",
            "UPLOAD_FOLDER": self.temp_dir.name,
        })
        self.client = self.app.test_client()

    def tearDown(self):
        self.temp_dir.cleanup()

    def candidate_form(self):
        return {
            "code_tresor_pay": "PAY-12345",
            "email": "candidat@example.ci",
            "password": "motdepasse-securise",
            "nom": "Kouassi",
            "prenoms": "Awa",
            "sexe": "F",
            "date_naissance": "2005-04-12",
            "telephone": "+2250700000000",
            "annee_bac": "2025",
            "serie_bac": "D",
            "choix_1_filiere": "DSER (Digitalisation des Services)",
            "note_math_bac": "15.50",
            "confirmation": "on",
        }

    def test_static_pages_and_health_route(self):
        root_response = self.client.get("/")
        connexion_response = self.client.get("/connexion")
        candidature_response = self.client.get("/candidature")
        contacts_response = self.client.get("/contacts")
        css_response = self.client.get("/css/contacts.css")
        self.assertEqual(root_response.status_code, 200)
        self.assertIn("L’avenir".encode("utf-8"), root_response.data)
        self.assertIn(b'href="/connexion"', root_response.data)
        self.assertNotIn(b'href="/candidature"', root_response.data)
        self.assertEqual(connexion_response.status_code, 200)
        self.assertIn(b'href="/candidature"', connexion_response.data)
        self.assertEqual(candidature_response.status_code, 302)
        self.assertEqual(candidature_response.location, "/connexion")
        registration_response = self.client.get("/candidature?inscription=1")
        self.assertEqual(registration_response.status_code, 200)
        self.assertIn(b'href="/connexion"', contacts_response.data)
        self.assertNotIn(b'href="/candidature"', contacts_response.data)
        self.assertEqual(css_response.status_code, 200)
        root_response.close()
        connexion_response.close()
        candidature_response.close()
        registration_response.close()
        contacts_response.close()
        css_response.close()
        with patch.object(api, "get_connection", return_value=self.connection):
            response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["database"], "connected")

    def test_candidature_requires_email_and_password_and_validates_email(self):
        response = self.client.post("/api/candidatures", data={"email": "bad"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.json["fields"])

        form = self.candidate_form()
        form.pop("confirmation")
        response = self.client.post("/api/candidatures", data=form)
        self.assertEqual(response.status_code, 400)
        self.assertIn("confirmer", response.json["error"])

        form = self.candidate_form()
        form["email"] = "not-an-email"
        response = self.client.post("/api/candidatures", data=form)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json["fields"], ["email"])

    def test_candidature_hashes_password_and_persists_document_metadata(self):
        with tempfile.TemporaryDirectory() as upload_dir:
            self.app.config["UPLOAD_FOLDER"] = upload_dir
            with patch.object(api, "get_connection", return_value=self.connection):
                response = self.client.post(
                    "/api/candidatures",
                    data={
                        **self.candidate_form(),
                        "attestation": (io.BytesIO(b"pdf-content"), "bac.pdf"),
                    },
                    content_type="multipart/form-data",
                )

            self.assertEqual(response.status_code, 201)
            self.assertTrue(self.connection.committed)
            candidate_query, candidate_values = self.connection.fake_cursor.executed[0]
            self.assertIn("note_math_bac", candidate_query)
            columns = candidate_query[
                candidate_query.index("(") + 1:candidate_query.index(") VALUES")
            ].split(", ")
            stored_password = candidate_values[columns.index("MDP")]
            self.assertNotEqual(stored_password, "motdepasse-securise")
            self.assertTrue(stored_password.startswith("scrypt:"))
            self.assertEqual(len(self.connection.fake_cursor.executed), 2)
            self.assertEqual(response.json["numero_dossier"][:4], "CDT_")
            saved_files = list(Path(upload_dir).rglob("*.pdf"))
            self.assertEqual(len(saved_files), 1)

    def test_rejects_unsupported_upload_before_database_access(self):
        with patch.object(api, "get_connection") as connect:
            response = self.client.post(
                "/api/candidatures",
                data={
                    **self.candidate_form(),
                    "attestation": (io.BytesIO(b"payload"), "payload.exe"),
                },
                content_type="multipart/form-data",
            )
        self.assertEqual(response.status_code, 400)
        connect.assert_not_called()

    def test_login_creates_session_and_logout_clears_it(self):
        candidate = {
            "numero_dossier": "CDT_ABC123",
            "email": "candidat@example.ci",
            "nom": "Kouassi",
            "prenoms": "Awa",
            "MDP": generate_password_hash("correct-password"),
        }
        login_connection = FakeConnection(candidate)
        profile = {
            key: value for key, value in candidate.items() if key != "MDP"
        }
        profile_connection = FakeConnection(profile)
        with patch.object(
            api,
            "get_connection",
            side_effect=[login_connection, profile_connection],
        ):
            response = self.client.post(
                "/api/auth/login",
                json={"identifiant": candidate["email"], "password": "correct-password"},
            )
            self.assertEqual(response.status_code, 200)
            self.assertNotIn("MDP", response.json)
            self.assertEqual(self.client.get("/api/auth/me").status_code, 200)
        response = self.client.post("/api/auth/logout")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.get("/api/auth/me").status_code, 401)

    def test_contact_validates_required_fields(self):
        response = self.client.post("/api/contacts", json={"email": "bad"})
        self.assertEqual(response.status_code, 400)


if __name__ == "__main__":
    unittest.main()
