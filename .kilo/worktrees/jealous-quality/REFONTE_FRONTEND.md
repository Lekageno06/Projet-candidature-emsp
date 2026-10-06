# Refonte du front-end EMSP

## Intention

Créer une vitrine institutionnelle EMSP inspirée de la direction artistique cinématique du [site de référence](https://chat.z.ai/s/85ba5110-5e2f-42dd-aa53-91daebc356b3) : contrastes marqués, composition éditoriale, titres condensés et interactions mesurées. Le résultat doit évoquer une école exigeante et accueillante, pas un studio sportif. Ne reprendre ni son identité, ni ses textes, ni ses images, ni son code.

## Direction visuelle

- Palette : noir charbon et graphite, blanc cassé pour la lecture, orange vif comme accent institutionnel, argent/gris pour les informations secondaires.
- Typographie : une police d’affichage condensée et affirmée pour les titres, associée à une police sans-serif lisible pour les formulaires et textes longs.
- Ambiance : photographie contrastée du campus, des étudiants et des formations; grain discret et séparateurs éditoriaux. Réserver des emplacements visuels clairement remplaçables jusqu’à réception de photos EMSP approuvées. Aucune imagerie de fitness et aucun chiffre/témoignage inventé.
- Mouvement : apparitions sobres au défilement, transitions courtes, bouton de candidature fixe après le héros; respecter `prefers-reduced-motion`.
- Responsive et accessible : composition adaptée au mobile, contraste lisible, navigation clavier, focus visible, interactions utilisables au tactile.

## Architecture des pages

### Accueil (`/`)

1. Navigation EMSP compacte avec accès Formations, Admission, Contact, Connexion et un bouton Candidater.
2. Héros plein cadre avec emplacement photo EMSP, nom EMSP visible immédiatement, accroche courte et actions « Découvrir les formations » et « Commencer ma candidature ».
3. Bandeau de repères institutionnels sans statistiques non vérifiées.
4. Présentation des filières de l'école : DSER (Digitalisation des Services), FDIG (Finance Digitale), MDIG (Marketing Digital), LNUM (Logistique et Numérique) et GARE (Gestion des Activités Réglementées de l’Économie).
5. Parcours d’admission en étapes lisibles, relié au formulaire réel.
6. Section contact et pied de page institutionnel.

### Connexion (`/connexion`)

Reprendre la direction visuelle avec un écran sobre et contrasté, formulaire concentré, identifiant email ou numéro de dossier, mot de passe et accès clair à la candidature. Conserver l’appel à `/api/auth/login` et les messages d’erreur existants.

### Candidature (`/candidature`)

Conserver toutes les étapes, champs, validations, upload de documents et l’intégration à `/api/candidatures`. Appliquer le thème sans réduire la lisibilité ni créer de distraction dans le formulaire. Conserver l’état de progression et rendre les actions principales évidentes.

### Contact (`/contacts`)

Conserver les coordonnées et le formulaire relié à `/api/contacts`, avec le même langage visuel et des retours de succès/erreur clairs.

## Interactions

- CTA de candidature persistant : apparaît une fois le héros quitté et disparaît lorsque la section d’action est visible.
- Révélation progressive des sections avec IntersectionObserver, désactivée ou simplifiée si le système demande moins de mouvement.
- Cartes de filières avec état hover/focus léger et lien cohérent vers le parcours d’admission; pas de retournement bloquant au toucher.
- Navigation mobile compacte et utilisable au clavier/tactile.
- Les boutons et liens gardent des libellés explicites; ne pas utiliser d’alertes navigateur pour les interactions de vitrine.

## Fichiers visés

- `front-end/accueil.html`, `front-end/css/accueil.css`, `front-end/js/accueil.js` : nouvelle page d’accueil.
- `front-end/connexion.html` et `front-end/css/connexion.css` : connexion à `/connexion` et harmonisation du thème.
- `front-end/candidature.html`, `front-end/css/style.css`, `front-end/js/script.js` : habillage du parcours existant, sans modifier le contrat API.
- `front-end/contacts.html`, `front-end/css/contacts.css`, `front-end/js/contacts.js` : thème et soumission API conservés.
- `front-end/assets/` : répertoire prévu pour les visuels institutionnels lorsqu’ils seront fournis.
- `back-end/app.py` : `/` sert l’accueil; `/connexion` sert la page de connexion. Les routes API restent inchangées.

## Vérification

1. Tester `/`, `/connexion`, `/candidature`, `/contacts`, ainsi que les assets CSS/JS.
2. Vérifier que l’inscription, la connexion/session et le formulaire contact utilisent toujours leurs endpoints existants.
3. Contrôler desktop et mobile : aucune superposition, héros correctement cadré, CTA fixe non intrusif, formulaires lisibles.
4. Vérifier navigation clavier, focus, contraste et préférence de réduction des animations.
5. Relancer les tests API Flask.

## Contenus à fournir

Les emplacements photo/vidéo seront prêts à accueillir des visuels réels de l’EMSP. Les modules témoignages et statistiques ne seront ajoutés qu’avec des informations authentiques et autorisées.
