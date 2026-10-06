# API EMSP

## Déploiement Render

Le Blueprint Render et les étapes de mise en production sont documentés dans [RENDER_DEPLOYMENT.md](../RENDER_DEPLOYMENT.md). Le forfait gratuit convient à une prévisualisation, pas à la conservation durable des documents de candidature.

## Prérequis

- Python 3.10 ou plus récent
- MySQL ou MariaDB en local

## Installation sous Windows PowerShell

Depuis la racine du projet :

```powershell
py -m venv back-end\.venv
.\back-end\.venv\Scripts\Activate.ps1
python -m pip install -r back-end\requirements.txt
Copy-Item back-end\.env.example back-end\.env
```

Renseigner les paramètres MySQL et une clé `FLASK_SECRET_KEY` longue dans `back-end/.env`. Ne pas partager ni versionner ce fichier.

Pour activer l’accès administrateur, définir `ADMIN_EMAIL` et un hash Werkzeug dans `back-end/.env`. Générer le hash avec :

```powershell
python -c "from werkzeug.security import generate_password_hash; print(generate_password_hash('VotreMotDePasseAdmin'))"
```

Copier le résultat dans `ADMIN_PASSWORD_HASH`. Après connexion avec cet email, l’administrateur est redirigé vers `/dashboard`. Cette page et son API refusent toute session qui n’a pas le rôle `admin`.

Pour une nouvelle base, exécuter `script.sql` avec MySQL/MariaDB. Si la table `candidature` existe déjà, exécuter également les deux définitions `CREATE TABLE IF NOT EXISTS` ajoutées à la fin de `script.sql`.

## Démarrage

```powershell
python back-end\app.py
```

Ouvrir `http://127.0.0.1:5000/` pour l’accueil EMSP. La connexion est à `/connexion`, la candidature à `/candidature`, les contacts à `/contacts` et le contrôle de connexion DB à `/api/health`.

Les fichiers envoyés sont déposés dans `back-end/uploads/`, en dehors du répertoire servi par Flask. La taille maximale est de 5 Mio par document et 64 Mio par requête.

## Tests

Depuis la racine :

```powershell
python -m unittest discover -s back-end\tests -v
```

Les tests utilisent une connexion MySQL simulée. Pour tester la persistance réelle, configurer la base locale puis vérifier `/api/health` et soumettre les formulaires dans le navigateur.
