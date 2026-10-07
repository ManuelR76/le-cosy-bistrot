# Le Cosy Bistrot — migration Elementor → Next.js headless

- `web/` — front Next.js 16 (App Router, TS, Tailwind 4), build standalone pour web app Node Hostinger.
- `contexte-projet/` — inventaire du site d'origine, architecture, décisions, procédure WordPress headless.

Démarrage : `cd web && cp .env.example .env.local && npm ci && npm run dev`.
Pour voir les photos en local avant la bascule : `NEXT_PUBLIC_WP_MEDIA_URL=https://lecosybistrot27.fr`.
