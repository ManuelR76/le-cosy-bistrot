import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { sessionValide } from "@/lib/edition/auth";
import { JOUR } from "@/lib/edition/dates";
import { ecrireBandeau, lireBandeau, stockageDisponible, TAG_BANDEAU, type Bandeau } from "@/lib/edition/store";

export const dynamic = "force-dynamic";

const refus = () => NextResponse.json({ erreur: "Session expirée, reconnectez-vous." }, { status: 401 });
const LIEN = /^(\/[^\s]*|https:\/\/[^\s]+|tel:[+\d\s.]+|mailto:[^\s@]+@[^\s@]+)$/;

/** Bandeau d'information actuel (panneau « Bandeau »). */
export async function GET() {
  if (!(await sessionValide())) return refus();
  return NextResponse.json({ bandeau: await lireBandeau() });
}

/** Enregistre le bandeau (le client peut le désactiver sans perdre son texte). */
export async function POST(req: Request) {
  if (!(await sessionValide())) return refus();
  if (!stockageDisponible()) return NextResponse.json({ erreur: "Stockage non configuré." }, { status: 503 });
  const b = (await req.json().catch(() => null)) as Partial<Bandeau> | null;
  if (!b) return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });

  const texte = String(b.texte ?? "").replace(/\s+/g, " ").trim();
  if (texte.length > 240) return NextResponse.json({ erreur: "Le message est trop long (240 caractères maximum)." }, { status: 400 });
  if (b.actif && texte.length < 3) return NextResponse.json({ erreur: "Écrivez le message du bandeau." }, { status: 400 });

  const label = String(b.lien?.label ?? "").trim().slice(0, 40);
  const href = String(b.lien?.href ?? "").trim();
  if (href && !LIEN.test(href)) return NextResponse.json({ erreur: "Adresse du lien invalide (ex. /privatisation/, https://…, tel:0227360549)." }, { status: 400 });
  if (href && !label) return NextResponse.json({ erreur: "Donnez un texte au lien (ex. « En savoir plus »)." }, { status: 400 });

  const jour = (v: unknown) => (typeof v === "string" && JOUR.test(v) && !Number.isNaN(Date.parse(v)) ? v : undefined);
  const debut = jour(b.debut);
  const fin = jour(b.fin);
  if ((b.debut && !debut) || (b.fin && !fin)) return NextResponse.json({ erreur: "Date invalide." }, { status: 400 });
  if (debut && fin && fin < debut) return NextResponse.json({ erreur: "La date de fin est avant la date de début." }, { status: 400 });

  const bandeau: Bandeau = {
    actif: Boolean(b.actif),
    texte,
    lien: href ? { label, href } : null,
    affichage: b.affichage === "popup" ? "popup" : "haut",
    style: b.style === "important" ? "important" : "info",
    ...(debut ? { debut } : {}),
    ...(fin ? { fin } : {}),
    version: Date.now(),
  };
  await ecrireBandeau(bandeau);
  revalidateTag(TAG_BANDEAU, { expire: 0 });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, bandeau });
}
