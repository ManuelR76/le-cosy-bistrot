import type { Edits } from "./store";

/** Clé d'édition d'un article ou d'une page légale : lettres et chiffres seulement. */
export const cleDe = (slug: string) => slug.replace(/[^A-Za-z0-9]/g, "");

const echapper = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const decoder = (t: string) =>
  t.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

/**
 * Texte saisi par le client → HTML échappé, en remettant les liens d'origine
 * dont l'ancre est toujours présente (maillage interne préservé).
 */
function texteVersHtml(texte: string, original: string): string {
  let html = echapper(texte);
  for (const [, attrs, ancreHtml] of original.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const ancre = echapper(decoder(ancreHtml.replace(/<[^>]+>/g, "")));
    if (!ancre.trim()) continue;
    const i = html.indexOf(ancre);
    if (i >= 0) html = html.slice(0, i) + `<a${attrs}>${ancre}</a>` + html.slice(i + ancre.length);
  }
  return html;
}

const BLOC = /<(p|h2|h3|h4|ul|ol|blockquote)\b([^>]*)>([\s\S]*?)<\/\1>/g;

/**
 * Découpe un corps HTML en blocs modifiables : chaque paragraphe, intertitre et ligne de liste
 * reçoit un data-edit « <prefixe>.bN » (ou « bNiM » pour une ligne de liste) et, s'il a été modifié,
 * son texte remplace l'original.
 */
export function blocsModifiables(html: string, prefixe: string, edits: Edits): string {
  let n = 0;
  return html.replace(BLOC, (tout, tag: string, attrs: string, interieur: string) => {
    const id = `b${n++}`;
    if (tag === "ul" || tag === "ol") {
      let m = 0;
      const lignes = interieur.replace(/<li\b([^>]*)>([\s\S]*?)<\/li>/g, (_l, la: string, li: string) => {
        const chemin = `${prefixe}.${id}i${m++}`;
        if (/<(p|ul|ol)\b/.test(li)) return _l; // liste imbriquée : laissée telle quelle
        const contenu = edits[chemin] !== undefined ? texteVersHtml(edits[chemin], li) : li;
        return `<li${la} data-edit="${chemin}">${contenu}</li>`;
      });
      return `<${tag}${attrs}>${lignes}</${tag}>`;
    }
    if (tag === "blockquote") return tout;
    const chemin = `${prefixe}.${id}`;
    if (/<(img|iframe|figure|table)\b/.test(interieur)) return tout; // bloc média : non modifiable en texte
    const contenu = edits[chemin] !== undefined ? texteVersHtml(edits[chemin], interieur) : interieur;
    return `<${tag}${attrs} data-edit="${chemin}">${contenu}</${tag}>`;
  });
}
