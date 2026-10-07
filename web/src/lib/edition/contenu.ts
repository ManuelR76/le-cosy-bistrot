import "server-only";
import { accueil, evenement, leCosyBistrot, privatisation, retrouvezNous } from "@/content/pages";
import { site as siteDefaut } from "@/site.config";
import { lireEdits, type Edits } from "./store";

/** Applique les modifications « chemin.vers.champ » → valeur sur une copie profonde. */
function appliquer<T>(base: T, edits: Edits, prefixe: string): T {
  const copie = structuredClone(base) as Record<string, unknown>;
  for (const [cle, valeur] of Object.entries(edits)) {
    if (!cle.startsWith(prefixe + ".")) continue;
    const parties = cle.slice(prefixe.length + 1).split(".");
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
