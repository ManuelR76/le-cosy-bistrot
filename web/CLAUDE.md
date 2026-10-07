@AGENTS.md

# Le Cosy Bistrot — front Next.js

Migration du site WordPress/Elementor https://lecosybistrot27.fr (méthode Helloweb, skill `helloweb-site-pipeline`).
Lire `../contexte-projet/` avant chaque phase : inventaire, ARCHITECTURE.md, MIGRATION-DECISIONS.md, WORDPRESS-HEADLESS.md.

## Règles
- Contenu repris mot pour mot de l'inventaire ; jamais inventé (prix, horaires, mentions). TODO plutôt que fiction.
- Repli statique obligatoire : `src/content/` + `src/site.config.ts`. Le site tourne WordPress éteint.
- Tokens dans `src/app/globals.css` (`@theme`). Pas de hex en dur.
- Médias : chemins `/wp-content/uploads/...` via `Media`/`mediaUrl()` → `NEXT_PUBLIC_WP_MEDIA_URL`.
- Aucun traceur ni iframe tierce avant consentement (`components/consent.ts`).
- Ne rien mettre en prod, ne pas toucher au DNS ni au WordPress sans accord explicite.

## Commandes
npm run dev · npm run build · node scripts/check-redirects.mjs http://localhost:3000

## État d'avancement
- [x] Phase 1 — Inventaire (07/10/2026)
- [x] Phase 2 — Architecture (ARCHITECTURE.md)
- [x] Phase 3 — Intégration de tous les gabarits sur repli statique ; articles et pages légales branchés WPGraphQL
- [ ] Phase 3b — Champs ACF des pages (accueil, offres, options) branchés
- [x] Phase 5 (partiel) — 301, sitemap, robots, script de contrôle (33/33)
- [ ] Phase 4 — GA4 réel en préprod, formulaires : aucun
- [ ] Phase 6 — QA sur préprod avec vraies images (Lighthouse, comparaison mesurée)
- Bloquants client : licence Gimoc Botuned, prix 16,90 vs 21,90, mentions légales (décisions 12–15)
