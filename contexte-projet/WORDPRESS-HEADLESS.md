# Passage du WordPress actuel en headless — procédure (à exécuter avec ton feu vert)

Rien n'a été modifié sur le WordPress de production. Ordre proposé :

1. **Sauvegarde complète** (fichiers + base) depuis hPanel.
2. **Sous-domaine** `admin.lecosybistrot27.fr` sur le même compte Hostinger, pointant sur le même dossier WP.
   Ne pas toucher aux enregistrements MX.
3. **Extensions** : WPGraphQL, WPGraphQL for ACF, ACF, WPGraphQL for AIOSEO (fournit `seo { title description }` utilisé par le front — sans elle, la requête des articles échoue et le front reste sur le repli statique).
4. **Relever les IDs** des 7 pages et 12 articles (`/?p=ID`, `/?page_id=ID`) → ajouter les 301 correspondantes dans `next.config.ts`.
5. **Groupes ACF** (exposés en GraphQL) — branchement côté front en Phase 3b :
   - Options « Infos » : adresse, lien Maps, téléphone, horaires (répéteur jour/texte), formules (répéteur titre/détail/prix).
   - Page Accueil : hero, horaires, menus, 2 teasers (voir `web/src/content/pages.ts` → `accueil`).
   - Page offre (Privatisation, Évènement) : hero, sections (répéteur), galerie.
6. **Bascule** (Phase 5) : `siteurl`/`home` WP → `https://admin.lecosybistrot27.fr`, front Next sur le domaine principal (web app Node), purge CDN, soumission du sitemap.
7. Après bascule : désactiver Elementor côté rendu public (le domaine admin peut rester en noindex + mot de passe hors /graphql et /wp-content/uploads).
