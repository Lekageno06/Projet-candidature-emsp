"""Ajoute le statut des candidatures à une base existante."""

from app import get_connection


connection = get_connection()
cursor = connection.cursor()
try:
    cursor.execute(
        "SELECT COUNT(*) FROM information_schema.columns "
        "WHERE table_schema = DATABASE() AND table_name = 'candidature' "
        "AND column_name = 'statut_candidature'"
    )
    if cursor.fetchone()[0] == 0:
        cursor.execute(
            "ALTER TABLE candidature ADD COLUMN statut_candidature "
            "VARCHAR(20) NOT NULL DEFAULT 'en_traitement' AFTER dossier_valide"
        )
    cursor.execute(
        "UPDATE candidature SET statut_candidature = "
        "CASE WHEN dossier_valide = 1 THEN 'valide' ELSE 'en_traitement' END "
        "WHERE statut_candidature IS NULL OR statut_candidature = '' "
        "OR (statut_candidature = 'en_traitement' AND dossier_valide = 1)"
    )
    connection.commit()
    print("Migration des statuts terminée.")
finally:
    cursor.close()
    connection.close()
