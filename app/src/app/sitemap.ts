import type { MetadataRoute } from "next";
import { accueil, evenement, leCosyBistrot, privatisation, retrouvezNous } from "@/content/pages";
import { getArticles, getPageLegale } from "@/lib/content";
import { site } from "@/site.config";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const u = (p: string) => site.url + p;
  const pages = [
    { url: u("/"), lastModified: accueil.meta.published },
    { url: u("/le-cosy-bistrot/"), lastModified: leCosyBistrot.meta.modified },
    { url: u("/privatisation/"), lastModified: privatisation.meta.modified },
    { url: u("/evenement/"), lastModified: evenement.meta.modified },
    { url: u("/retrouvez-nous/"), lastModified: retrouvezNous.meta.modified },
    { url: u("/mentions-legales/"), lastModified: (await getPageLegale("mentions-legales")).modified },
    { url: u("/politique-de-confidentialite/"), lastModified: (await getPageLegale("politique-de-confidentialite")).modified },
  ];
  const articles = await getArticles();
  return [
    ...pages,
    { url: u("/articles/"), lastModified: articles[0]?.modified },
    ...articles.map((a) => ({ url: u(`/${a.slug}/`), lastModified: a.modified })),
  ];
}
