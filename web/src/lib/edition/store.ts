import "server-only";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Stockage des modifications faites par le client.
 * - Vercel : Vercel Blob (BLOB_READ_WRITE_TOKEN présent).
 * - Hostinger / Node : fichiers sur disque (CONTENU_DIR, par défaut ./.contenu), photos servies par /medias/…
 */
export type Edits = Record<string, string>;

const BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const DIR = process.env.CONTENU_DIR || path.join(process.cwd(), ".contenu");
const FICHIER = "contenu.json";

export const TAG = "contenu";

/** URL publique du magasin Blob, déduite du jeton (vercel_blob_rw_<storeId>_…). */
function urlBlob(cle: string): string {
  const id = (process.env.BLOB_READ_WRITE_TOKEN || "").split("_")[3]?.toLowerCase();
  return `https://${id}.public.blob.vercel-storage.com/${cle}`;
}

export function stockageDisponible(): boolean {
  return BLOB || process.env.VERCEL !== "1";
}

export async function lireEdits(): Promise<Edits> {
  try {
    if (BLOB) {
      const res = await fetch(urlBlob(FICHIER), { next: { tags: [TAG], revalidate: 60 } });
      return res.ok ? ((await res.json()) as Edits) : {};
    }
    return JSON.parse(await fs.readFile(path.join(DIR, FICHIER), "utf8")) as Edits;
  } catch {
    return {};
  }
}

export async function ecrireEdits(edits: Edits): Promise<void> {
  const json = JSON.stringify(edits, null, 2);
  if (BLOB) {
    const { put } = await import("@vercel/blob");
    await put(FICHIER, json, { access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json", cacheControlMaxAge: 60 });
    return;
  }
  await fs.mkdir(DIR, { recursive: true });
  // Historique : on garde la version précédente pour pouvoir revenir en arrière.
  await fs.copyFile(path.join(DIR, FICHIER), path.join(DIR, `contenu-${Date.now()}.json`)).catch(() => {});
  await fs.writeFile(path.join(DIR, FICHIER), json);
}

export async function enregistrerPhoto(nom: string, data: ArrayBuffer, type: string): Promise<string> {
  const propre = nom.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");
  const cle = `photos/${Date.now()}-${propre}`;
  if (BLOB) {
    const { put } = await import("@vercel/blob");
    const res = await put(cle, Buffer.from(data), { access: "public", contentType: type });
    return res.url;
  }
  await fs.mkdir(path.join(DIR, "photos"), { recursive: true });
  await fs.writeFile(path.join(DIR, cle), Buffer.from(data));
  return `/medias/${cle.replace(/^photos\//, "")}`;
}

export async function lirePhotoLocale(nom: string): Promise<Buffer | null> {
  if (nom.includes("..") || nom.includes("/")) return null;
  return fs.readFile(path.join(DIR, "photos", nom)).catch(() => null);
}
