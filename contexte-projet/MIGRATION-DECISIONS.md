# Le Cosy Bistrot — décisions de migration

Source : https://lecosybistrot27.fr (WordPress 7.1.3, Elementor 4.3.4, AIOSEO)
Cible : Next.js (App Router) + TypeScript + Tailwind, WordPress headless (méthode helloweb-site-pipeline)

| # | Sujet | Décision | Date |
|---|-------|----------|------|
| 1 | Maquette | Identique à l'existant (pas de Figma) | 2026-10-07 |
| 2 | CMS | WP actuel en headless (WPGraphQL + ACF à installer, avec accord avant toute modif du WP) | 2026-10-07 |
| 3 | Police « Congratulations DEMO » | Remplacée par un équivalent libre auto-hébergé (proposition à valider) | 2026-10-07 |
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
| 12 | Police « Gimoc Botuned » (h1, logo) | **À trancher client** | Police commerciale Warisand Studio (« All Rights Reserved »). Fichier non repris tant que la licence web n'est pas prouvée ; repli Mouse Memoirs/Georgia en attendant. Si licence OK : convertir le TTF en woff2 → `public/fonts/Gimoc-Botuned.woff2`. |
| 13 | Équivalent libre « Congratulations DEMO » | **À valider** | Mouse Memoirs (OFL) intégrée. Alternatives : Bebas Neue, Amatic SC (gras). |
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
