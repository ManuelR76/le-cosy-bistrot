import type { NextConfig } from "next";

const ADMIN = "https://admin.lecosybistrot27.fr";
const media = new URL(process.env.NEXT_PUBLIC_WP_MEDIA_URL || ADMIN);

// Liens courts WordPress (/?p=ID, /?page_id=ID), IDs relevés via l'API REST publique le 07/10/2026.
const IDS_WP: [string, number, string][] = [
  ["p", 803, "/menu-cosy-ou-menu-express-pour-tous-les-gouts-au-cosy-bistrot/"],
  ["p", 799, "/bienvenue-chez-le-cosy-un-bistrot-convivial-a-bourg-achard/"],
  ["p", 795, "/votre-evenement-special-au-cosy-bistrot-dans-un-cadre-chaleureux-et-convivial/"],
  ["p", 791, "/vivez-des-soirees-inoubliables-au-son-de-nos-concerts-et-spectacles-en-live/"],
  ["p", 787, "/des-soirees-a-theme-inoubliables-au-cosy-bistrot/"],
  ["p", 783, "/plongez-dans-lambiance-animee-de-nos-soirees-evenements-au-cosy-bistrot/"],
  ["p", 779, "/organisation-devenements-ambiance-et-convivialite-au-cosy-bistrot/"],
  ["p", 775, "/privatisation-pour-mariages-et-anniversaires-celebrez-au-cosy-bistrot/"],
  ["p", 771, "/salle-privatisee-faites-de-votre-evenement-un-moment-inoubliable-au-cosy-bistrot/"],
  ["p", 767, "/les-delices-au-menu-du-cosy-bistrot-des-plats-allechants-pour-toutes-les-envies/"],
  ["p", 763, "/restaurant-le-cosy-bistrot-votre-pause-gourmande-quotidienne-a-bourg-achard/"],
  ["p", 757, "/le-cosy-bistrot-votre-destination-culinaire-a-bourg-achard/"],
  ["page_id", 19, "/retrouvez-nous/"],
  ["p", 19, "/retrouvez-nous/"],
  ["page_id", 11, "/articles/"],
  ["p", 11, "/articles/"],
  ["page_id", 10, "/privatisation/"],
  ["p", 10, "/privatisation/"],
  ["page_id", 9, "/evenement/"],
  ["p", 9, "/evenement/"],
  ["page_id", 8, "/le-cosy-bistrot/"],
  ["p", 8, "/le-cosy-bistrot/"],
  ["page_id", 7, "/mentions-legales/"],
  ["p", 7, "/mentions-legales/"],
  ["page_id", 3, "/politique-de-confidentialite/"],
  ["p", 3, "/politique-de-confidentialite/"],
];

const nextConfig: NextConfig = {
  output: "standalone",
  trailingSlash: true,
  poweredByHeader: false,
  // Repli statique lu à l'exécution (ISR) : à embarquer dans le build standalone.
  outputFileTracingIncludes: { "/**": ["./src/content/**/*"] },
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: media.hostname, pathname: "/wp-content/uploads/**" },
    ],
    localPatterns: [{ pathname: "/medias/**" }, { pathname: "/fonts/**" }],
  },
  async redirects() {
    return [
      ...IDS_WP.map(([cle, id, destination]) => ({
        source: "/",
        has: [{ type: "query" as const, key: cle, value: String(id) }],
        destination,
        statusCode: 301 as const,
      })),
      // Archives WordPress : décision 4 (MIGRATION-DECISIONS.md)
      { source: "/category/:path*", destination: "/articles/", statusCode: 301 },
      { source: "/tag/:path*", destination: "/articles/", statusCode: 301 },
      { source: "/author/:path*", destination: "/articles/", statusCode: 301 },
      { source: "/feed", destination: "/articles/", statusCode: 301 },
      { source: "/comments/feed", destination: "/articles/", statusCode: 301 },
      { source: "/:slug/feed", destination: "/:slug/", statusCode: 301 },
      { source: "/articles/page/:n", destination: "/articles/", statusCode: 301 },
      // Plans de site AIOSEO / WordPress
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", statusCode: 301 },
      { source: "/wp-sitemap.xml", destination: "/sitemap.xml", statusCode: 301 },
      { source: "/:type(post|page|category|post_tag)-sitemap.xml", destination: "/sitemap.xml", statusCode: 301 },
      { source: "/sitemap.rss", destination: "/sitemap.xml", statusCode: 301 },
      // Médias et administration : servis par le WordPress déplacé sur admin.
      { source: "/wp-content/uploads/:path*", destination: `${ADMIN}/wp-content/uploads/:path*`, statusCode: 301 },
      { source: "/wp-admin/:path*", destination: `${ADMIN}/wp-admin/:path*`, statusCode: 301 },
      { source: "/wp-login.php", destination: `${ADMIN}/wp-login.php`, statusCode: 301 },
      // TODO(phase-5) : /?p=ID et /?page_id=ID → relever les ID dans WordPress.
    ];
  },
};

export default nextConfig;
