import { NextResponse } from "next/server";
import { sessionValide } from "@/lib/edition/auth";
import { listerVersions } from "@/lib/edition/store";

export const dynamic = "force-dynamic";

/** Historique des versions enregistrées (panneau « Historique »). */
export async function GET() {
  if (!(await sessionValide())) return NextResponse.json({ erreur: "Session expirée, reconnectez-vous." }, { status: 401 });
  return NextResponse.json({ versions: await listerVersions(), assistant: Boolean(process.env.ANTHROPIC_API_KEY) });
}
