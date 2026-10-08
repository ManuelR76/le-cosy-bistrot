import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getArticles } from "@/lib/content";
import { sessionValide } from "@/lib/edition/auth";
import { ecrireActualites, lireActualites, stockageDisponible, TAG_ACTUS, type Actualite } from "@/lib/edition/store";

export const dynamic = "force-dynamic";

const refus = () => NextResponse.json({ erreur: "Session expirée, reconnectez-vous." }, { status: 401 });

function slugifier(t: string): string {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/œ/g, "oe")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

const RESERVES = new Set(["articles", "privatisation", "evenement", "le-cosy-bistrot", "retrouvez-nous", "mentions-legales", "politique-de-confidentialite", "connexion", "api", "medias", "fonts", "category", "tag", "feed", "wp-content", "wp-admin"]);

function publier(slugs: string[]) {
  revalidateTag(TAG_ACTUS, { expire: 0 });
  revalidatePath("/", "layout");
  for (const s of slugs) revalidatePath(`/${s}/`);
}

/** Liste des actualités ajoutées par le client. */
export async function GET() {
  if (!(await sessionValide())) return refus();
  return NextResponse.json({ actualites: (await lireActualites()).sort((a, b) => b.date.localeCompare(a.date)) });
}

/** Créer ou modifier une actualité. */
export async function POST(req: Request) {
  if (!(await sessionValide())) return refus();
  if (!stockageDisponible()) return NextResponse.json({ erreur: "Stockage non configuré." }, { status: 503 });
  const b = (await req.json().catch(() => null)) as Partial<Actualite> | null;
  const titre = (b?.titre ?? "").trim();
  const texte = (b?.texte ?? "").replace(/\r/g, "").trim();
  if (titre.length < 3 || titre.length > 140) return NextResponse.json({ erreur: "Le titre doit faire entre 3 et 140 caractères." }, { status: 400 });
  if (texte.length < 20 || texte.length > 20000) return NextResponse.json({ erreur: "Le texte est trop court (20 caractères minimum)." }, { status: 400 });
  const date = b?.date && !Number.isNaN(Date.parse(b.date)) ? new Date(b.date).toISOString() : new Date().toISOString();
  const image =
    b?.image && typeof b.image.src === "string" && /^\/medias\/[\w.-]+$|^\/wp-content\/uploads\//.test(b.image.src)
      ? { src: b.image.src, alt: String(b.image.alt ?? titre).slice(0, 200) }
      : null;

  const actus = await lireActualites();
  const maintenant = new Date().toISOString();
  let actu = b?.id ? actus.find((a) => a.id === b.id) : undefined;
  const anciens = actu ? [actu.slug] : [];
  if (actu) {
    Object.assign(actu, { titre, texte, date, image, modifie: maintenant });
  } else {
    // Adresse de l'article : tirée du titre, unique, sans collision avec une page du site.
    const pris = new Set([...(await getArticles()).map((a) => a.slug), ...actus.map((a) => a.slug), ...RESERVES]);
    let slug = slugifier(titre) || "actualite";
    for (let i = 2; pris.has(slug); i++) slug = `${slugifier(titre)}-${i}`;
    actu = { id: crypto.randomUUID(), slug, titre, texte, date, modifie: maintenant, image };
    actus.push(actu);
  }
  await ecrireActualites(actus);
  publier([...anciens, actu.slug]);
  return NextResponse.json({ ok: true, actualite: actu, url: `/${actu.slug}/` });
}

/** Supprimer une actualité. */
export async function DELETE(req: Request) {
  if (!(await sessionValide())) return refus();
  const { id } = ((await req.json().catch(() => ({}))) as { id?: string }) ?? {};
  const actus = await lireActualites();
  const cible = actus.find((a) => a.id === id);
  if (!cible) return NextResponse.json({ erreur: "Actualité introuvable." }, { status: 404 });
  await ecrireActualites(actus.filter((a) => a.id !== id));
  publier([cible.slug]);
  return NextResponse.json({ ok: true });
}
