import type { NextConfig } from "next";

const ADMIN = "https://admin.lecosybistrot27.fr";
const media = new URL(process.env.NEXT_PUBLIC_WP_MEDIA_URL || ADMIN);

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
    remotePatterns: [{ protocol: "https", hostname: media.hostname, pathname: "/wp-content/uploads/**" }],
  },
  async redirects() {
    return [
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
