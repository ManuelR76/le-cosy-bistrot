import type { MetadataRoute } from "next";
import { site } from "@/site.config";

/** Préprod : NEXT_PUBLIC_NOINDEX=1 bloque tout. Prod : indexable. */
export default function robots(): MetadataRoute.Robots {
  if (process.env.NEXT_PUBLIC_NOINDEX === "1") return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${site.url}/sitemap.xml` };
}
