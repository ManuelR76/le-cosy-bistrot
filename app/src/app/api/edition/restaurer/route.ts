import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { sessionValide } from "@/lib/edition/auth";
import { ecrireEdits, lireVersion, TAG } from "@/lib/edition/store";

/** Remet le site dans l'état d'une version précédente (la version actuelle part elle-même dans l'historique). */
export async function POST(req: Request) {
  if (!(await sessionValide())) return NextResponse.json({ erreur: "Session expirée, reconnectez-vous." }, { status: 401 });
  const { id } = ((await req.json().catch(() => ({}))) as { id?: string }) ?? {};
  const version = id ? await lireVersion(id) : null;
  if (!version) return NextResponse.json({ erreur: "Version introuvable." }, { status: 404 });
  await ecrireEdits(version);
  revalidateTag(TAG, { expire: 0 });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
