import type { Metadata } from "next";
import { site } from "@/site.config";

type Args = { title: string; description: string; path: string; type?: "website" | "article"; image?: string | null; published?: string; modified?: string };

/** Métadonnées reprises de l'inventaire (title complet, description, canonical absolu avec slash final). */
export function meta({ title, description, path, type = "website", image, published, modified }: Args): Metadata {
  const url = site.url + path;
  return {
    title: { absolute: title },
    description: description || undefined,
    alternates: { canonical: url },
    robots:
      process.env.NEXT_PUBLIC_NOINDEX === "1"
        ? { index: false, follow: false }
        : { index: true, follow: true, "max-image-preview": "large" },
    openGraph: {
      type,
      locale: site.locale,
      siteName: site.name,
      title,
      description: description || undefined,
      url,
      ...(image ? { images: [{ url: image }] } : {}),
      ...(type === "article" ? { publishedTime: published, modifiedTime: modified } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

const ORG_ID = `${site.url}/#organization`;
const WEBSITE_ID = `${site.url}/#website`;

/** Graphe équivalent à celui d'AIOSEO (Organization, WebSite, WebPage, BreadcrumbList). */
export function graphe(opts: { path: string; title: string; description: string; crumbs: { name: string; path: string }[]; extra?: object[] }) {
  const url = site.url + opts.path;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": ORG_ID, name: site.name, url: site.url + "/", telephone: "+33227360549" },
      { "@type": "WebSite", "@id": WEBSITE_ID, url: site.url + "/", name: site.name, inLanguage: "fr-FR", publisher: { "@id": ORG_ID } },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumblist`,
        itemListElement: opts.crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: site.url + c.path })),
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: opts.title,
        description: opts.description,
        inLanguage: "fr-FR",
        isPartOf: { "@id": WEBSITE_ID },
        breadcrumb: { "@id": `${url}#breadcrumblist` },
      },
      ...(opts.extra ?? []),
    ],
  };
}
