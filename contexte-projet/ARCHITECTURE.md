# Architecture — Le Cosy Bistrot (Phase 2)

Pile : Next.js 16 App Router + TypeScript + Tailwind 4, `output: 'standalone'` (web app Node Hostinger).
CMS : WordPress actuel déplacé sur `admin.lecosybistrot27.fr`, WPGraphQL + ACF, ISR `revalidate = 60`.
Le front tourne **sans WordPress** : chaque contenu retombe sur `src/content/` (copie fidèle du site au 07/10/2026).

## Routes (slugs conservés, slash final partout via `trailingSlash: true`)

| Ancienne URL | Nouvelle route | Source |
|---|---|---|
| `/` | `app/page.tsx` | page WP « Accueil » + ACF `accueil` |
| `/le-cosy-bistrot/` | `app/le-cosy-bistrot/page.tsx` | page + ACF `page_offre` |
| `/privatisation/` | `app/privatisation/page.tsx` | idem |
| `/evenement/` | `app/evenement/page.tsx` | idem |
| `/retrouvez-nous/` | `app/retrouvez-nous/page.tsx` | page + options `infos` |
| `/mentions-legales/`, `/politique-de-confidentialite/` | `app/(legal)/…` | contenu WP (HTML) |
| `/articles/` | `app/articles/page.tsx` | posts |
| `/<slug-article>/` (12) | `app/[slug]/page.tsx` | post |
| `/category/*`, `/tag/*`, `/feed/`, `/comments/feed/`, `/author/*` | **301 → `/articles/`** | décision 4 |
| `/sitemap_index.xml`, `/wp-sitemap.xml`, `/*-sitemap.xml`, `/sitemap.rss` | **301 → `/sitemap.xml`** | |
| `/wp-content/uploads/*` | **301 → `https://admin.lecosybistrot27.fr/wp-content/uploads/*`** | liens externes vers médias |
| `/wp-admin/*`, `/wp-login.php` | **301 → admin.** | |
| `/?p=ID`, `/?page_id=ID` | 301 vers la cible (IDs à relever dans WP) | TODO Phase 5 |

## Composants (`src/components/`)
Header, MenuMobile, Footer, CarteGoogle, HeroSplit, Diaporama, BordDechire, SectionTexteDiaporama,
BandeauFormules, CarteTeaser, CarteArticle, GrilleArticles, Carrousel, Horaires, InfosContact,
Bouton, Filet, Prose (rendu Markdown/HTML WP), BandeauCookies, Analytics.

## Modèle de contenu WordPress (ACF → GraphQL)
- **Options « Infos »** (global) : adresse, lien Maps, téléphone, horaires (répéteur jour/libellé), formules (répéteur titre/détail/prix).
- **Page Accueil** : hero (h1, h2, texte, CTA, 3 diaporamas), horaires (titre, texte, diaporama), menus (titre, texte, diaporama), teasers ×2.
- **Page offre** (gabarit partagé) : hero (h1, h2, texte, CTA, 2 diaporamas), sections (répéteur titre/texte/CTA/diaporama), galerie.
- **Articles** : natifs (titre, contenu, extrait, image à la une, catégorie) + champs AIOSEO (title/description) exposés via WPGraphQL for AIOSEO.

## Tokens
`src/app/globals.css` (`@theme` Tailwind 4) : couleurs rouge/rouge-vif/beige/noir/blanc/gris, `--font-display`, `--font-accent`, `--font-sans`.

## Images
Composant `Media` (next/image) ; chemins `/wp-content/uploads/...` résolus vers `NEXT_PUBLIC_WP_MEDIA_URL`.
`remotePatterns` limité à cet hôte. `priority` sur le seul hero.

## Variables d'environnement
`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WORDPRESS_API_URL`, `NEXT_PUBLIC_WP_MEDIA_URL`, `NEXT_PUBLIC_GA_ID`, `GOOGLE_SITE_VERIFICATION`.
