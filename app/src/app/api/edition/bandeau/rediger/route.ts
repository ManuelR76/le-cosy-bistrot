import { NextResponse } from "next/server";
import { sessionValide } from "@/lib/edition/auth";

/** Rédige le message du bandeau d'information à partir de quelques mots (assistant Claude). */
const MODELE = process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";

const SYSTEME = `Tu rédiges le message court du bandeau d'information du site du restaurant « Le Cosy Bistrot » à Bourg-Achard.
À partir des notes de la gérante, écris UN message en français : 1 ou 2 phrases, 160 caractères maximum, ton chaleureux et clair, sans emoji ni majuscules criardes.
N'invente AUCUNE information (date, horaire, prix, nom) absente des notes. Si une information essentielle manque, ne la devine pas.
Réponds en appelant l'outil rediger_bandeau.`;

const OUTIL = {
  name: "rediger_bandeau",
  description: "Renvoie le message du bandeau.",
  input_schema: { type: "object", properties: { texte: { type: "string" } }, required: ["texte"] },
};

export async function POST(req: Request) {
  if (!(await sessionValide())) return NextResponse.json({ erreur: "Session expirée, reconnectez-vous." }, { status: 401 });
  const cle = process.env.ANTHROPIC_API_KEY;
  if (!cle) return NextResponse.json({ erreur: "L'assistant n'est pas encore activé (clé API manquante)." }, { status: 503 });
  const { notes } = ((await req.json().catch(() => ({}))) as { notes?: string }) ?? {};
  if (!notes || notes.trim().length < 5) return NextResponse.json({ erreur: "Écrivez quelques mots sur ce que vous voulez annoncer." }, { status: 400 });

  const res = await fetch(`${process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com"}/v1/messages`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": cle, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: MODELE,
      max_tokens: 400,
      system: SYSTEME,
      tools: [OUTIL],
      tool_choice: { type: "tool", name: OUTIL.name },
      messages: [{ role: "user", content: `Notes : ${notes.slice(0, 1000)}` }],
    }),
    signal: AbortSignal.timeout(30000),
  }).catch(() => null);
  if (!res) return NextResponse.json({ erreur: "L'assistant ne répond pas pour le moment. Réessayez dans un instant." }, { status: 502 });
  if (!res.ok) {
    const detail = ((await res.json().catch(() => null)) as { error?: { message?: string } } | null)?.error?.message;
    console.error("[bandeau/rediger]", res.status, detail);
    const msg = res.status === 401 || res.status === 403 ? "L'assistant est refusé : la clé API n'est plus valide." : res.status === 404 ? "Modèle de l'assistant introuvable." : res.status === 429 ? "Trop de demandes, réessayez dans une minute." : "L'assistant ne répond pas pour le moment. Réessayez dans un instant.";
    return NextResponse.json({ erreur: msg }, { status: 502 });
  }
  const data = (await res.json()) as { content?: { type: string; input?: { texte?: string } }[] };
  const out = data.content?.find((c) => c.type === "tool_use")?.input;
  if (!out?.texte) return NextResponse.json({ erreur: "Je n'ai pas réussi à rédiger, réessayez." }, { status: 502 });
  return NextResponse.json({ texte: out.texte.slice(0, 240) });
}
