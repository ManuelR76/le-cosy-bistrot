import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";

/**
 * Stockage des modifications faites par le client.
 * - Vercel : magasin Vercel Blob privé (BLOB_STORE_ID + OIDC, ou BLOB_READ_WRITE_TOKEN).
 * - Hostinger / Node : fichiers sur disque (CONTENU_DIR, par défaut ./.contenu).
 * Dans les deux cas, les photos sont servies par /medias/<nom>.
 */
export type Edits = Record<string, string>;
export const TAG = "contenu";

const BLOB = Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
const DIR = process.env.CONTENU_DIR || path.join(process.cwd(), ".contenu");
const FICHIER = "contenu.json";

export function stockageDisponible(): boolean {
  return BLOB || process.env.VERCEL !== "1";
}

async function lireBlob(cle: string): Promise<{ data: Buffer; type: string } | null> {
  const { get } = await import("@vercel/blob");
  const res = await get(cle, { access: "private", useCache: false }).catch(() => null);
  if (!res || res.statusCode !== 200) return null;
  return { data: Buffer.from(await new Response(res.stream).arrayBuffer()), type: res.blob.contentType };
}

const lireEditsBlob = unstable_cache(
  async (): Promise<Edits> => {
    const f = await lireBlob(FICHIER);
    return f ? (JSON.parse(f.data.toString("utf8")) as Edits) : {};
  },
  ["contenu-edits"],
  { tags: [TAG], revalidate: 300 },
);

export async function lireEdits(): Promise<Edits> {
  try {
    if (BLOB) return await lireEditsBlob();
    return JSON.parse(await fs.readFile(path.join(DIR, FICHIER), "utf8")) as Edits;
  } catch {
    return {};
  }
}

export async function ecrireEdits(edits: Edits): Promise<void> {
  const json = JSON.stringify(edits, null, 2);
  if (BLOB) {
    const { put, copy } = await import("@vercel/blob");
    // Historique : copie horodatée de la version précédente.
    await copy(FICHIER, `historique/contenu-${Date.now()}.json`, { access: "private", addRandomSuffix: false }).catch(() => {});
    await put(FICHIER, json, { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json" });
    return;
  }
  await fs.mkdir(DIR, { recursive: true });
  await fs.copyFile(path.join(DIR, FICHIER), path.join(DIR, `contenu-${Date.now()}.json`)).catch(() => {});
  await fs.writeFile(path.join(DIR, FICHIER), json);
}

export async function enregistrerPhoto(nom: string, data: ArrayBuffer, type: string): Promise<string> {
  const propre = `${Date.now()}-${nom.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "")}`;
  if (BLOB) {
    const { put } = await import("@vercel/blob");
    await put(`photos/${propre}`, Buffer.from(data), { access: "private", addRandomSuffix: false, contentType: type });
  } else {
    await fs.mkdir(path.join(DIR, "photos"), { recursive: true });
    await fs.writeFile(path.join(DIR, "photos", propre), Buffer.from(data));
  }
  return `/medias/${propre}`;
}

export async function lirePhoto(nom: string): Promise<{ data: Buffer; type?: string } | null> {
  if (nom.includes("..") || nom.includes("/")) return null;
  if (BLOB) return lireBlob(`photos/${nom}`);
  const data = await fs.readFile(path.join(DIR, "photos", nom)).catch(() => null);
  return data ? { data } : null;
}
