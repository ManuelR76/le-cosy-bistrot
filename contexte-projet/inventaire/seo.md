# SEO existant

- Extension : All in One SEO 5.0.2.1. Sitemap `/sitemap.xml` (index : post, page, category, post_tag) + `/sitemap.rss`.
- robots.txt : `Disallow: /wp-admin/`, `Allow: /wp-admin/admin-ajax.php`.
- Meta robots : `max-image-preview:large` partout, aucun noindex.
- Titles : « <titre> - Le Cosy Bistrot ». Meta description = début du contenu sur les pages (troncature AIOSEO), rédigée sur les articles.
- Canonical : URL absolue avec slash final sur toutes les pages.
- JSON-LD (graphe AIOSEO) : WebSite, Organization, WebPage, BreadcrumbList ; BlogPosting + Person + ImageObject sur articles ; CollectionPage sur archives. **Pas de Restaurant/LocalBusiness** (décision 7 : non ajouté pour l'instant).
- OG : og:image vide partout.
- Convention d'URL : slash final.
- Redirections actives : non visibles (pas d'accès admin) — à vérifier dans WP (plugin Redirection ?).
- Points relevés : deux h1 sur les pages offre ; fautes d'accent dans plusieurs titres (« Restaurant a Bourg-Achard », « Evenements »), conservées.
