import fs from "node:fs/promises";
import path from "node:path";
import { markdownToHtml, parseMarkdown, stripTags } from "./markdown";
import { lireActualites, lireEdits, type Actualite } from "./edition/store";
import { blocsModifiables, cleDe } from "./edition/blocs";
import { wpPage, wpPosts } from "./wordpress";

const CONTENT = path.join(process.cwd(), "src/content");

export type Article = {
  slug: string;
  h1: string;
  title: string;
  description: string;
  html: string;
  extrait: string;
  published: string;
  modified: string;
  category: string;
  image: { src: string; alt: string } | null;
  /** Chemin d'édition sur la page (absent pour les actualités du client, qui ont leur propre formulaire). */
  edition?: string;
};

/** Extrait façon WordPress (premiers mots du chapô, « … »). */
function extrait(html: string, mots = 20): string {
  const t = stripTags(html).split(" ");
  return t.length > mots ? t.slice(0, mots).join(" ") + "…" : t.join(" ");
}

async function articlesStatiques(): Promise<Article[]> {
  const dir = path.join(CONTENT, "articles");
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
  return Promise.all(
    files.map(async (f) => {
      const { data, body } = parseMarkdown(await fs.readFile(path.join(dir, f), "utf8"));
      const html = markdownToHtml(body);
      return {
        slug: f.replace(/\.md$/, ""),
        h1: data.h1,
        title: data.title,
        description: data.description,
        html,
        extrait: extrait(html),
        published: data.published,
        modified: data.modified,
        category: data.category,
        image: data.image ? { src: data.image, alt: data.imageAlt ?? "" } : null,
      };
    }),
  );
}

const echapper = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Actualité saisie par le client : texte brut → paragraphes HTML échappés. */
export function actualiteVersArticle(a: Actualite): Article {
  const paragraphes = a.texte
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const html = paragraphes.map((p) => `<p>${echapper(p).replace(/\n/g, "<br>")}</p>`).join("\n");
  const texteSeul = paragraphes.join(" ");
  return {
    slug: a.slug,
    h1: a.titre,
    title: `${a.titre} - Le Cosy Bistrot`,
    description: texteSeul.length > 155 ? texteSeul.slice(0, 154).replace(/\s+\S*$/, "") + "…" : texteSeul,
    html,
    extrait: extrait(html),
    published: a.date,
    modified: a.modifie,
    category: "Actualités",
    image: a.image,
  };
}

/** Articles triés du plus récent au plus ancien (ordre WordPress). */
export async function getArticles(): Promise<Article[]> {
  const wp = await wpPosts();
  const list: Article[] = wp
    ? wp.map((p) => ({
        slug: p.slug,
        h1: p.title,
        title: p.seo?.title || `${p.title} - Le Cosy Bistrot`,
        description: p.seo?.description || stripTags(p.excerpt),
        html: p.content,
        extrait: extrait(p.excerpt || p.content),
        published: p.date,
        modified: p.modified,
        category: p.categories.nodes[0]?.name ?? "",
        image: p.featuredImage ? { src: p.featuredImage.node.sourceUrl, alt: p.featuredImage.node.altText } : null,
      }))
    : await articlesStatiques();
  const edits = await lireEdits();
  for (const a of list) {
    a.edition = `articles.${cleDe(a.slug)}`;
    a.h1 = edits[`${a.edition}.titre`] ?? a.h1;
    a.html = blocsModifiables(a.html, a.edition, edits);
    a.extrait = extrait(a.html);
  }
  const pris = new Set(list.map((a) => a.slug));
  const actus = (await lireActualites()).filter((a) => !pris.has(a.slug)).map(actualiteVersArticle);
  return [...list, ...actus].sort((a, b) => b.published.localeCompare(a.published));
}

export async function getArticle(slug: string): Promise<Article | null> {
  return (await getArticles()).find((a) => a.slug === slug) ?? null;
}

export type PageLegale = { title: string; description: string; h1: string; html: string; modified: string; edition: string };

export async function getPageLegale(slug: "mentions-legales" | "politique-de-confidentialite"): Promise<PageLegale> {
  const { data, body } = parseMarkdown(await fs.readFile(path.join(CONTENT, "legal", `${slug}.md`), "utf8"));
  const h1 = body.match(/^# (.+)$/m)?.[1] ?? data.title;
  const statique = {
    title: data.title,
    description: data.description,
    h1,
    html: markdownToHtml(body.replace(/^# .+$/m, "")),
    modified: data.modified,
  };
  const wp = await wpPage(`/${slug}/`);
  const p = wp ? { ...statique, h1: wp.title, html: wp.content, modified: wp.modified } : statique;
  const edits = await lireEdits();
  const edition = `legal.${cleDe(slug)}`;
  return { ...p, h1: edits[`${edition}.titre`] ?? p.h1, html: blocsModifiables(p.html, edition, edits), edition };
}
