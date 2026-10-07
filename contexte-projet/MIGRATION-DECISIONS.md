# Le Cosy Bistrot — décisions de migration

Source : https://lecosybistrot27.fr (WordPress 7.1.3, Elementor 4.3.4, AIOSEO)
Cible : Next.js (App Router) + TypeScript + Tailwind, WordPress headless (méthode helloweb-site-pipeline)

| # | Sujet | Décision | Date |
|---|-------|----------|------|
| 1 | Maquette | Identique à l'existant (pas de Figma) | 2026-10-07 |
| 2 | CMS | WP actuel en headless (WPGraphQL + ACF à installer, avec accord avant toute modif du WP) | 2026-10-07 |
| 3 | Police « Congratulations DEMO » | ~~Équivalent libre~~ → police d'origine conservée (voir 12) | 2026-10-07 |
| 4 | Catégories (4) + tag `/tag/bourg-achard/` | 301 vers `/articles/` | 2026-10-07 |
| 5 | Analytics | Même GTM/GA4 conservé | 2026-10-07 |
| 6 | Tracker `track.helloweb-agence.fr` | Non retenu — à confirmer | 2026-10-07 |
| 7 | JSON-LD Restaurant/LocalBusiness | Non retenu pour l'instant (on garde l'existant : Organization, WebSite, BreadcrumbList, BlogPosting) | 2026-10-07 |
| 8 | Bandeau cookies | Oui, bandeau léger ; GTM/GA4 chargé après consentement (Consent Mode v2) | 2026-10-07 |
| 9 | Hébergement front | Web app Node Hostinger | 2026-10-07 |
| 10 | Bascule DNS | Pas de date fixée, à décider en Phase 5 | 2026-10-07 |
| 11 | Accès | WP admin + hébergeur/DNS disponibles ; WP passera sur un sous-domaine admin (aucune modif sans feu vert) | 2026-10-07 |

## Écarts et points relevés pendant l'intégration (07/10/2026)

| # | Sujet | Statut | Détail |
|---|-------|--------|--------|
| 12 | Polices | **Décidé Helloweb (07/10)** : polices d'origine reprises | Gimoc Botuned (Warisand Studio, « All Rights Reserved ») et Congratulations DEMO (version démo) remises à l'identique, auto-hébergées. Risque de licence à lever avec le client (achat des licences web). |
| 13 | Équivalent libre « Congratulations DEMO » | Annulé | Remplace la décision 3 : on garde la police d'origine. |
| 14 | Prix incohérents | **À trancher client** | Accueil et /le-cosy-bistrot/ : formules 21,90 € / 23,90 € / 18,90 € ; 3 articles de 2024 disent 16,90 €. Repris tels quels. |
| 15 | Mentions légales | **À trancher client** | Paragraphe sur « articles rédigés par des scientifiques / conseils médicaux » hors sujet (modèle copié). Politique de confidentialité : formulaire « Contactez-nous » inexistant. Repris tels quels. |
| 16 | Double h1 | Corrigé | Pages offre et /le-cosy-bistrot/ avaient deux h1 ; le second devient un sous-titre (même style). |
| 17 | Contraste | Corrigé (a11y) | h1 rouge #B10F2E sur #111 = 2,67:1 → h1 des articles/légal en #E11439 (token rouge-vif) ; liens du texte en beige souligné. |
| 18 | Carrousel /le-cosy-bistrot/ | Corrigé | Cassé sur l'existant (24 px de haut) ; rétabli avec les 9 mêmes images. |
| 19 | Carte Google Maps | Changé (RGPD) | Iframe chargée après consentement ; sinon bouton « Afficher la carte » + lien Maps. |
| 20 | Titres des cartes articles | Changé | L'existant affichait le titre WP sans accents dans la grille ; on affiche le titre de l'article (h1). |
| 21 | « Top of Form » | Corrigé | Résidu de copier-coller Word en fin de 2 articles, supprimé. |
| 22 | Médias | Architecture | Restent dans la médiathèque WP (admin.). `/wp-content/uploads/*` → 301 vers admin. Favicon servi depuis WP en attendant copie locale. |
| 23 | Redirections | Fait | 301 directes (catégories, tag, flux, plans de site AIOSEO, médias, wp-admin). Slash final : 308 natif Next (équivalent 301). `/?p=ID` : IDs à relever dans WP (Phase 5). |
| 24 | Extraits | Info | 20 mots + « … », comme la grille Elementor. |
| 25 | Alignements | Corrigé | Relevé au getBoundingClientRect à 1440 : contenu limité à 1440 px avec marges 64 (16 mobile), bandeau formules pleine largeur, hero accueil 50 % avec bloc texte 400 px centré, hero des pages offre 45,5vw à droite, hauteur 75vh, logo 48 px, horaires alignés en haut, pied 364 / 50 / 364 / reste. |
| 26 | Édition par le client | **Décidé Helloweb (07/10)** : édition directement sur la page | `/connexion/` (mot de passe unique) → barre « Mode édition » : clic sur un texte pour le réécrire, bouton « Changer les photos » sur chaque diaporama / image, « Enregistrer ». Textes bruts uniquement (pas de mise en forme), liens et structure non modifiables. Modifications stockées hors code (Vercel Blob sur Vercel, fichiers sur disque sur Hostinger, historique conservé sur disque). Articles et pages légales : non couverts dans cette version. |
| 27 | Panneau d'édition (bas droite) | Fait | Onglets Assistant (Claude via API Anthropic, propose et surligne, rien publié sans « Enregistrer », chemins filtrés côté serveur), Modifs (liste + annuler), Google (titre/description par page, aperçu), Historique (revenir à une version), Aide. Assistant inactif tant que ANTHROPIC_API_KEY n'est pas définie. Modèle : ANTHROPIC_MODEL (défaut claude-sonnet-5-5). |
| 28 | Actualités ajoutées par le client | Fait | Onglet « Actus » du panneau + bouton « + Ajouter une actualité » (accueil, /articles/) en mode édition : titre, photo, texte (paragraphes), date ; « Rédiger pour moi » à partir de notes (assistant). Adresse tirée du titre, unique, jamais une page existante. Modifier / supprimer. Texte échappé (pas de HTML). Stockées à part (actualites.json) ; les 12 articles d'origine restent intacts. |
| 29 | Édition des articles d'origine et pages légales | Fait | Titre et chaque paragraphe / intertitre / ligne de liste modifiables sur la page (texte brut). Les liens internes d'origine sont réinjectés si leur ancre reste dans le texte. Balises title/description inchangées (SEO). |
