import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { sessionValide } from "@/lib/edition/auth";
import { cheminAutorise } from "@/lib/edition/autorise";
import { ecrireEdits, lireEdits, stockageDisponible, TAG } from "@/lib/edition/store";


/** Enregistre un lot de modifications { "accueil.hero.titre": "…" }. */
export async function POST(req: Request) {
  if (!(await sessionValide())) return NextResponse.json({ erreur: "Session expirée, reconnectez-vous." }, { status: 401 });
  if (!stockageDisponible()) return NextResponse.json({ erreur: "Stockage non configuré." }, { status: 503 });
  const body = (await req.json().catch(() => null)) as { modifications?: Record<string, unknown> } | null;
  const mods = body?.modifications;
  if (!mods || typeof mods !== "object") return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  const propres: Record<string, string> = {};
  for (const [k, v] of Object.entries(mods)) {
    if (!cheminAutorise(k) || typeof v !== "string" || v.length > 5000) continue;
    propres[k] = v.replace(/ /g, " ").trim();
  }
  const edits = { ...(await lireEdits()), ...propres };
  await ecrireEdits(edits);
  revalidateTag(TAG, { expire: 0 });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, enregistres: Object.keys(propres).length });
}
