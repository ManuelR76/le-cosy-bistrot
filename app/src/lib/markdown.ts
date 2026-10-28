import { marked } from "marked";

export type FrontMatter = Record<string, string>;

/** Front matter « clé: "valeur JSON" » tel qu'écrit par l'inventaire. */
export function parseMarkdown(raw: string): { data: FrontMatter; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw };
  const data: FrontMatter = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i < 0) continue;
    const v = line.slice(i + 1).trim();
    try {
      data[line.slice(0, i).trim()] = JSON.parse(v);
    } catch {
      data[line.slice(0, i).trim()] = v;
    }
  }
  return { data, body: m[2] };
}

export function markdownToHtml(md: string): string {
  return marked.parse(md, { async: false, gfm: true, breaks: false }) as string;
}

export function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}
