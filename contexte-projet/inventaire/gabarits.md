# Gabarits — Le Cosy Bistrot (relevé 07/10/2026, 1440 px)

| Gabarit | Pages | Structure |
|---|---|---|
| Accueil | `/` | Hero split · Horaires (texte + diaporama) · Formules (fond rouge + 3 cartes prix) · 2 cartes Privatisation/Événement · 3 derniers articles · pied |
| Page offre | `/le-cosy-bistrot/`, `/privatisation/`, `/evenement/` | Hero split · 1–2 sections texte+diaporama (filet rouge 100 px sous h2) · carrousel d'images 3/2/1 |
| Contact | `/retrouvez-nous/` | Carte Google Maps pleine largeur · texte · 2 icon-box (adresse, tél) · horaires |
| Article | 12 articles | Thème Hello : conteneur 1140, h1 rouge Gimoc 48, image 600×400, chapô italique, h2 beige |
| Archive | `/articles/` (+ catégories/tag → 301) | Grille de cartes loop (image 260 + corps rouge, bord déchiré) |
| Légal | `/mentions-legales/`, `/politique-de-confidentialite/` | Texte long |

## Sections récurrentes → composants
- **Header** : barre haute (adresse → Maps, tél) + barre nav (logo texte Gimoc, menu 4 entrées). Sticky (clone Elementor). Mobile : burger rouge.
- **HeroSplit** : col. gauche 50 % diaporama fond + voile #111 50 % + h1/h2/texte/CTA ; col. droite 2 diaporamas empilés 328 px, gap 20 (masquée < 768).
- **Diaporama** (slideshow fond Elementor) : 3 images, 7 s/diapo, fondu.
- **BordDechire** : shape-divider Elementor « brush » haut/bas (SVG d'origine repris).
- **SectionTexteDiaporama** : 2 colonnes 624/624, gap 50.
- **BandeauFormules** : fond #B10F2E, texte 894 + 3 cartes #111 (titre beige 35 px, détail, prix).
- **CarteTeaser** (privatisation/événement) : diaporama 350 + corps rouge 251 + CTA blanc.
- **CarteArticle** : image 260 + corps rouge, titre Congratulations 35 uppercase, extrait, CTA « Lire l'article ».
- **Carrousel** : 3 / 2 / 1 vues, espacement 64/32/16, autoplay 5 s, pause au survol.
- **Horaires** (icon-list), **IconBox** (adresse/tél), **CarteGoogle** (iframe).
- **Footer** : logo + adresse + tél · plan du site · (carte) · barre légale.
