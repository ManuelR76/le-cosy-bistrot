import { NextResponse } from "next/server";
import { sessionValide } from "@/lib/edition/auth";
import { enregistrerPhoto, stockageDisponible } from "@/lib/edition/store";

const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX = 8 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await sessionValide())) return NextResponse.json({ erreur: "Session expirée, reconnectez-vous." }, { status: 401 });
  if (!stockageDisponible()) return NextResponse.json({ erreur: "Stockage non configuré." }, { status: 503 });
  const form = await req.formData().catch(() => null);
  const f = form?.get("photo");
  if (!(f instanceof File)) return NextResponse.json({ erreur: "Aucune photo reçue." }, { status: 400 });
  if (!TYPES.includes(f.type)) return NextResponse.json({ erreur: "Format accepté : JPG, PNG, WebP ou AVIF." }, { status: 415 });
  if (f.size > MAX) return NextResponse.json({ erreur: "Photo trop lourde (8 Mo maximum)." }, { status: 413 });
  const url = await enregistrerPhoto(f.name, await f.arrayBuffer(), f.type);
  return NextResponse.json({ url });
}
