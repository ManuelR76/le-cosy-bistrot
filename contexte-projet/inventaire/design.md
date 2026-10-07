# Design relevé (getComputedStyle, 1440 / 375)

## Couleurs (kit Elementor)
| Token | Hex | Usage |
|---|---|---|
| rouge | #B10F2E | boutons, fonds de sections/cartes, h1 article, liens |
| rouge-vif | #E11439 | survol |
| beige | #E3C7B5 | h2/h3 intérieurs, menu |
| noir | #111111 | fond du site |
| blanc | #F5F5F5 | texte |
| gris | #DBDBDB | secondaire |

## Typographie
| Rôle | Police | Desktop | Mobile |
|---|---|---|---|
| h1 (display) | Gimoc Botuned 400 | 48/48 | 28 |
| h2/h3 (secondaire) | Congratulations DEMO 400 | 35/35 | 25 |
| boutons / nav | Congratulations DEMO 600 | 22 (nav 16–22) | — |
| texte | Arial 16/24 | | justifié en hero mobile |

Polices hébergées en TTF dans `wp-content/uploads/2024/02/` (licences à vérifier, voir décisions).

## Espacements
- Conteneur : 1297 px utile (padding latéral 64 px desktop, 16 px mobile). Articles : 1140.
- Sections : padding vertical 100 px.
- Colonnes : 624 + 50 + 624.
- Boutons : padding 12/24, rayon 0, fond rouge, texte #F5F5F5 ; variante blanche (texte rouge) sur fonds rouges.
- Filet : 1 px rouge, 100 px de large sous les h2.
- Bord déchiré : SVG « brush » Elementor, 15–20 px, haut et bas.
- Voile du hero : #111 à 50 %.

## Breakpoints Elementor
mobile ≤ 767, tablette ≤ 1024.
