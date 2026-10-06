# Déploiement sur Render

## Décision avant la production

Le dépôt déclare actuellement un service web Python gratuit. Il peut servir l'application pour une démonstration, mais ne constitue pas une configuration de production adaptée aux dossiers de candidature :

- Le service gratuit s'endort après 15 minutes sans trafic et son réveil peut prendre environ une minute. Render limite aussi les heures d'instance gratuites par espace de travail et suspend les services gratuits si le quota est épuisé.
- Son système de fichiers est éphémère. Les documents enregistrés sous `UPLOAD_FOLDER` peuvent disparaître au redémarrage, à un redéploiement ou à la mise en veille. Le forfait gratuit ne permet pas de disque persistant.
- Render ne propose pas de base MySQL gérée. L'application utilise `mysql-connector-python` : il faut donc une base MySQL externe, accessible depuis Render, et un jeu de données de production initialisé avant le premier déploiement.
- La base PostgreSQL gratuite de Render n'est pas une solution de remplacement immédiate : elle est limitée à 1 Go et expire 30 jours après sa création; l'application actuelle n'utilise pas PostgreSQL.

Ne mettez pas en production des pièces d'identité ou d'autres données personnelles avec le profil gratuit et le stockage local actuel. Pour une vraie mise en production, prévoyez une instance web payante, un stockage durable adapté aux documents (ou un disque Render payant, avec une seule instance), ainsi qu'une base MySQL externe avec sauvegardes. Vérifiez les coûts et exigences de conservation avant de choisir le fournisseur.

## Première mise en service

1. Avant tout push public, renouveler les secrets qui ont été utilisés dans `back_end/.env` : le fichier était déjà présent dans l'historique Git. Son retrait du suivi empêche les prochains commits de le republier, mais ne supprime pas les anciennes versions de l'historique. Renouveler au minimum les clés CloudConvert et tout identifiant ou mot de passe réutilisé. Ne jamais pousser `.env`.
2. Créer une base MySQL de production chez un fournisseur externe, dans une région proche de Render si possible. Restreindre ses accès réseau si le fournisseur le permet et utiliser des identifiants dédiés à l'application.
3. Initialiser cette base avec le schéma de l'application. Le fichier disponible dans `bdd pour les test avec les comptes/emsp2.sql` est destiné aux tests : vérifiez son contenu et n'importez pas de comptes ou données de test en production. Préparez un schéma propre, sans données de test, et conservez une sauvegarde avant l'import.
4. Dans Render, choisir **New > Blueprint**, connecter le dépôt GitHub et sélectionner la branche de production. Render détecte le `render.yaml` à la racine et crée le service `emsp-portail`.
5. Lors de la création du Blueprint, renseigner les variables marquées `sync: false` : `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` et `CLOUDCONVERT_API_KEYS`. Les secrets ne sont demandés qu'à la création initiale du Blueprint; pour un Blueprint déjà créé, les ajouter/modifier dans **Environment** du service. `CLOUDCONVERT_API_KEYS` n'est nécessaire que si la conversion CloudConvert est utilisée.
6. Générer localement le hash du mot de passe administrateur, sans mettre le mot de passe en clair dans le dépôt :

   ```powershell
   python -c "from getpass import getpass; from werkzeug.security import generate_password_hash; print(generate_password_hash(getpass()))"
   ```

   Coller uniquement le hash obtenu dans `ADMIN_PASSWORD_HASH`. Le nom de la base doit être celui du schéma initialisé. `FLASK_SECRET_KEY` est générée automatiquement par le Blueprint.

7. Vérifier dans les logs que le build et le déploiement réussissent, puis ouvrir l'URL `onrender.com` du service. Le health check `/api/health` vérifie aussi la connexion MySQL; une base inaccessible ou un mauvais paramètre empêche le service de passer en état sain.

Après cette configuration initiale, un push sur la branche GitHub liée déclenche automatiquement le build et le déploiement. Aucun secret ni fichier `.env` ne doit être ajouté au dépôt.

## Vérifications avant chaque mise en production

- La base répond depuis Render et les sauvegardes sont opérationnelles.
- L'administrateur peut se connecter et les comptes de test ne sont pas présents.
- Les documents téléversés ont un stockage durable et une politique de sauvegarde/rétention adaptée. Le `UPLOAD_FOLDER` actuel vaut `/tmp/emsp-uploads` sur Render et n'est pas durable.
- Les clés révélées ou réutilisées ont été renouvelées; `.env` est absent du prochain commit.
- Le forfait, les quotas et le comportement d'endormissement correspondent à l'usage attendu.

## Documentation officielle

- [Render Free](https://render.com/docs/free) : veille, quotas, stockage éphémère et expiration de PostgreSQL gratuit.
- [Blueprint Specification](https://render.com/docs/blueprint-spec) : configuration de `render.yaml` et variables secrètes.
- [Deploys](https://render.com/docs/deploys) : déploiements automatiques depuis GitHub et cycle build/démarrage.
- [Persistent Disks](https://render.com/docs/disks) : stockage persistant, disponible sur les services payants.
- [Render PostgreSQL](https://render.com/docs/postgresql-creating-connecting) : création et connexion à PostgreSQL géré.
