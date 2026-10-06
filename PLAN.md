# Plan d’architecture EMSP

## Objectif

Séparer l’interface web dans `front-end/` et l’API Flask dans `back-end/`. En développement local, Flask servira les pages et les endpoints API depuis la même origine.

## Architecture cible

```text
TP-API/
├── PLAN.md
├── script.sql
├── front-end/
│   ├── candidature.html
│   ├── connexion.html
│   ├── contacts.html
│   ├── css/
│   └── js/
└── back-end/
    ├── app.py
    ├── requirements.txt
    ├── .env.example
    ├── README.md
    ├── uploads/       # fichiers déposés, ignorés par Git
    └── tests/
```

Le classeur Excel et le dossier `.kilo/` restent à la racine et ne sont pas déplacés.

## Travaux

1. Déplacer les pages HTML et leurs dossiers CSS/JS vers `front-end/`, puis corriger les chemins d’assets et liens internes.
2. Créer l’application Flask, configurer MySQL via variables d’environnement et documenter l’installation sous Windows.
3. Compléter `script.sql` avec les tables de métadonnées de documents et de messages de contact.
4. Implémenter la création de candidature multipart : validation, numéro de dossier généré côté serveur, mot de passe haché, contrôle des doublons et dépôt sécurisé des fichiers.
5. Implémenter les endpoints de connexion/session et de contact; ne jamais renvoyer le hash du mot de passe ni rendre les documents accessibles publiquement.
6. Relier les formulaires existants à l’API et supprimer les simulations côté navigateur.
7. Ajouter des tests ciblés et lancer l’application si les prérequis MySQL et dépendances sont disponibles.

## Endpoints prévus

- `POST /api/candidatures` : créer une candidature et traiter ses documents.
- `POST /api/auth/login` : authentifier par email ou numéro de dossier.
- `GET /api/auth/me` et `POST /api/auth/logout` : consulter et terminer la session.
- `POST /api/contacts` : enregistrer un message de contact.
- `GET /api/health` : vérifier que l’API répond.

## Décisions et points d’attention

- Base visée : MySQL/MariaDB locale; secrets conservés dans `.env`, jamais dans le dépôt.
- Le formulaire de candidature recevra les champs email et mot de passe manquants au schéma. Les mots de passe seront hachés avant stockage dans `MDP`.
- Les documents seront stockés dans un dossier non exposé par le serveur web; seuls les métadonnées et le numéro de dossier seront enregistrés en base. Les extensions et tailles seront validées côté serveur.
- Les messages de contact seront persistés dans une table dédiée.
- Les noms des notes du formulaire seront alignés sur `note_*_bac` dans `script.sql`.
- Les références à `contacts.css` et `contacts.js` existent, mais ces fichiers sont absents du projet initial; le JavaScript de contact sera ajouté et le CSS uniquement si nécessaire.
- Les liens vers les pages Conditions et Admis restent à traiter séparément, car ces pages sont absentes du projet.

## Vérifications

- Installer les dépendances dans un environnement virtuel, configurer `.env` localement et appliquer `script.sql`.
- Vérifier l’accueil, les pages servies, les chemins CSS/JS et les formulaires.
- Tester création, doublons, connexion correcte/incorrecte, fichiers refusés et enregistrement des messages.
- Lancer les tests automatisés et vérifier que `.env` et les fichiers téléversés sont ignorés par Git.
