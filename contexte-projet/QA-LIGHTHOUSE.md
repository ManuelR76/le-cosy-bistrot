# QA Lighthouse — build standalone local (07/10/2026)

Conditions : `node .next/standalone/server.js`, Lighthouse 12, Chromium headless. Images WordPress **non joignables** depuis l'environnement de test (proxy) et `NOINDEX=1` (préprod).

| Page | Mobile perf | Desktop perf | Accessibilité | Bonnes pratiques | SEO |
|---|---|---|---|---|---|
| / | 80 | 100 | 100 | 96 | 69 |
| /le-cosy-bistrot/ | 87 | 100 | 100 | 96 | 69 |
| /articles/ | 81 | 100 | 100 | 96 | 61 |
| article | 86 | 99 | 100 | 96 | 69 |
| /retrouvez-nous/ | 91 | 100 | 100 | 96 | 66 |

- SEO < 100 : uniquement `noindex` volontaire de préprod (is-crawlable). Bonnes pratiques < 100 : uniquement les images bloquées par le proxy (erreurs console).
- CLS ≤ 0,07 partout ; TBT 220 ms mobile.
- LCP mobile ≈ 3,2 s : l'élément mesuré est un paragraphe du hero parce que les images ne chargent pas ici. Mesure à refaire sur la préprod avec les vraies images avant conclusion.
