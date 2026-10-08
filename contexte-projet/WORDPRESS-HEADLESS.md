# Passage du WordPress actuel en headless — procédure (à exécuter avec ton feu vert)

Rien n'a été modifié sur le WordPress de production. Ordre proposé :

1. ✅ (08/10/2026) Sauvegarde UpdraftPlus complète (base + fichiers), marquée « à conserver ».
   **Sauvegarde complète** (fichiers + base) depuis hPanel.
2. **Sous-domaine** `admin.lecosybistrot27.fr` sur le même compte Hostinger, pointant sur le même dossier WP.
   Ne pas toucher aux enregistrements MX.
3. ✅ (08/10/2026) WPGraphQL, ACF, WPGraphQL for ACF installées et activées. WPGraphQL for AIOSEO **non installée** (hors répertoire officiel) : le front reprend title/description de l'inventaire.
   ⚠️ Le pare-feu de l'hébergeur renvoie 403 sur les POST vers `/graphql` : utiliser `https://lecosybistrot27.fr/?graphql`.
   ⚠️ Contenus WP : image à la une répétée en tête d'article et « Top of Form » → nettoyés par `nettoyerContenu()`. Pages légales WP en Elementor → le front garde la version statique.
   **Extensions** : WPGraphQL, WPGraphQL for ACF, ACF, WPGraphQL for AIOSEO (fournit `seo { title description }` utilisé par le front — sans elle, la requête des articles échoue et le front reste sur le repli statique).
4. ✅ (07/10/2026, via l'API REST publique) **Relever les IDs** des 7 pages et 12 articles (`/?p=ID`, `/?page_id=ID`) → ajouter les 301 correspondantes dans `next.config.ts`.
5. **Groupes ACF** (exposés en GraphQL) — branchement côté front en Phase 3b :
   - Options « Infos » : adresse, lien Maps, téléphone, horaires (répéteur jour/texte), formules (répéteur titre/détail/prix).
   - Page Accueil : hero, horaires, menus, 2 teasers (voir `web/src/content/pages.ts` → `accueil`).
   - Page offre (Privatisation, Évènement) : hero, sections (répéteur), galerie.
6. **Bascule** (Phase 5) : `siteurl`/`home` WP → `https://admin.lecosybistrot27.fr`, front Next sur le domaine principal (web app Node), purge CDN, soumission du sitemap.
7. Après bascule : désactiver Elementor côté rendu public (le domaine admin peut rester en noindex + mot de passe hors /graphql et /wp-content/uploads).


## État au 08/10/2026
API prête mais **non branchée** : `NEXT_PUBLIC_WORDPRESS_API_URL` n'est pas défini sur Vercel, le site reste sur le repli statique. À activer après vérification que Vercel/Hostinger passent le pare-feu.
