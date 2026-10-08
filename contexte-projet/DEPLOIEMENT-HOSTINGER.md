# Déploiement préprod / prod — Hostinger (web app Node)

Rien n'est mis en ligne sans feu vert. Le DNS n'est pas touché tant que la bascule n'est pas décidée (décision 10).

## Build (08/10/2026 : compilation sur GitHub, pas sur Hostinger)
- L'hébergement mutualisé a une glibc trop ancienne (GLIBC_2.29 absente) : SWC natif ne charge pas, `next build` échoue.
- `.github/workflows/hostinger.yml` compile à chaque push sur `main` et pousse le résultat sur la branche **`hostinger`** (dossier `app/` = standalone, `package.json` racine sans dépendance).
- Web app Hostinger : dépôt ManuelR76/le-cosy-bistrot, branche `hostinger`, dossier racine `/`, build `npm run build` (no-op), démarrage `npm start` (`node app/server.js`).
- Les variables NEXT_PUBLIC_* sont figées au build (dans le workflow) ; les autres (EDITION_*, CONTENU_DIR, ANTHROPIC_API_KEY) se règlent dans hPanel.

### Ancienne procédure (VPS / Node récent)
- Node 24, depuis `web/` : `npm ci && npm run build:hostinger`
- Démarrage : `npm run start:hostinger` (= `node .next/standalone/server.js`), PORT/HOSTNAME fournis par Hostinger.
- `scripts/standalone.mjs` copie `public/` et `.next/static/` dans le dossier standalone (sinon polices et JS en 404).
- Vérifié en local le 07/10/2026 : pages 200, polices servies, sitemap OK, `check-redirects` 33/33.

## Variables d'environnement
| Variable | Préprod | Prod |
|---|---|---|
| NEXT_PUBLIC_SITE_URL | URL préprod | https://lecosybistrot27.fr |
| NEXT_PUBLIC_NOINDEX | 1 | (vide) |
| NEXT_PUBLIC_WP_MEDIA_URL | https://admin.lecosybistrot27.fr (après bascule WP) | idem |
| WP_GRAPHQL_URL | (vide tant que WP headless pas installé → repli statique) | idem |
| EDITION_MOT_DE_PASSE / EDITION_SECRET | à générer | à générer |
| CONTENU_DIR | dossier **persistant hors du dossier de build** (ex. `~/cosy-contenu`) | idem |
| ANTHROPIC_API_KEY | clé (assistant) | idem |

⚠️ Sans Blob, les modifications du client sont des fichiers dans CONTENU_DIR : ce dossier doit survivre aux redéploiements et être sauvegardé. Les modifications déjà faites sur Vercel (Blob) sont à exporter avant bascule.

## Avant bascule DNS
1. Préprod sur sous-domaine, noindex.
2. QA : Lighthouse avec les vraies images, comparaison au site actuel, `check-redirects` sur l'URL préprod.
3. Relever les `/?p=ID` dans WP (Phase 5) et les ajouter aux redirections.
4. Validation client (décisions 12–15).
