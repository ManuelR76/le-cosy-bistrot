import "server-only";
import { accueil, evenement, leCosyBistrot, privatisation, retrouvezNous } from "@/content/pages";
import { site as siteDefaut } from "@/site.config";
import { lireEdits, type Edits } from "./store";

/** Applique les modifications « chemin.vers.champ » → valeur sur une copie profonde. */
function appliquer<T>(base: T, edits: Edits, prefixe: string): T {
  const copie = structuredClone(base) as Record<string, unknown>;
  // Les listes de photos (« …liste », JSON) s'appliquent en dernier : elles remplacent le groupe entier.
  const entrees = Object.entries(edits).sort(([a], [b]) => Number(a.endsWith(".liste")) - Number(b.endsWith(".liste")));
  for (const [cle, valeur] of entrees) {
    if (!cle.startsWith(prefixe + ".")) continue;
    const parties = cle.slice(prefixe.length + 1).split(".");
    if (parties[parties.length - 1] === "liste") {
      let srcs: unknown;
      try {
        srcs = JSON.parse(valeur);
      } catch {
        continue;
      }
      if (!Array.isArray(srcs) || !srcs.length || !srcs.every((x) => typeof x === "string")) continue;
      let parent: Record<string, unknown> | undefined = copie;
      for (const p of parties.slice(0, -2)) {
        const suivant: unknown = parent?.[p];
        parent = suivant && typeof suivant === "object" ? (suivant as Record<string, unknown>) : undefined;
      }
      const cleTableau = parties[parties.length - 2];
      const ancien = parent?.[cleTableau];
      if (parent && Array.isArray(ancien)) {
        const images = ancien as { src: string; alt: string }[];
        parent[cleTableau] = (srcs as string[]).map((src, i) => ({ src, alt: images.find((x) => x.src === src)?.alt ?? images[i]?.alt ?? "" }));
      }
      continue;
    }
    let noeud: Record<string, unknown> | undefined = copie;
    for (const p of parties.slice(0, -1)) {
      const suivant: unknown = noeud?.[p];
      noeud = suivant && typeof suivant === "object" ? (suivant as Record<string, unknown>) : undefined;
    }
    const der = parties[parties.length - 1];
    if (noeud && typeof noeud[der] === "string") noeud[der] = valeur;
  }
  return copie as T;
}

function telHref(tel: string): string {
  const chiffres = tel.replace(/\D/g, "");
  return chiffres.startsWith("0") ? `tel:+33${chiffres.slice(1)}` : `tel:+${chiffres}`;
}

export async function getContenu() {
  const e = await lireEdits();
  const site = appliquer(siteDefaut, e, "site");
  return {
    site: { ...site, telephoneHref: telHref(site.telephone) },
    accueil: appliquer(accueil, e, "accueil"),
    privatisation: appliquer(privatisation, e, "privatisation"),
    evenement: appliquer(evenement, e, "evenement"),
    leCosyBistrot: appliquer(leCosyBistrot, e, "leCosyBistrot"),
    retrouvezNous: appliquer(retrouvezNous, e, "retrouvezNous"),
  };
}

export type Contenu = Awaited<ReturnType<typeof getContenu>>;
export type SiteContenu = Contenu["site"];
