import { NextResponse } from "next/server";
import { sessionValide } from "@/lib/edition/auth";

/** Rédige un titre et un texte d'actualité à partir de quelques notes (assistant Claude). */
const MODELE = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

const SYSTEME = `Tu rédiges les actualités du site du restaurant « Le Cosy Bistrot » à Bourg-Achard (cuisine maison, ambiance chaleureuse et conviviale).
À partir des notes de la gérante, écris une actualité courte en français : un titre accrocheur (60 caractères maximum) et 2 à 4 paragraphes simples séparés par une ligne vide.
Ton chaleureux, phrases simples, pas d'emoji, pas de superlatifs creux.
N'invente AUCUNE information factuelle (date, prix, horaire, nom, menu) absente des notes. Si une information utile manque, laisse-la de côté plutôt que de l'inventer.
Réponds en appelant l'outil rediger_actualite.`;

const OUTIL = {
  name: "rediger_actualite",
  description: "Renvoie l'actualité rédigée.",
  input_schema: {
    type: "object",
    properties: { titre: { type: "string" }, texte: { type: "string" } },
    required: ["titre", "texte"],
  },
};

export async function POST(req: Request) {
  if (!(await sessionValide())) return NextResponse.json({ erreur: "Session expirée, reconnectez-vous." }, { status: 401 });
  const cle = process.env.ANTHROPIC_API_KEY;
  if (!cle) return NextResponse.json({ erreur: "L'assistant n'est pas encore activé (clé API manquante)." }, { status: 503 });
  const { notes, titre } = ((await req.json().catch(() => ({}))) as { notes?: string; titre?: string }) ?? {};
  if (!notes || notes.trim().length < 5) return NextResponse.json({ erreur: "Écrivez quelques mots sur ce que vous voulez annoncer." }, { status: 400 });

  const res = await fetch(`${process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com"}/v1/messages`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": cle, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: MODELE,
      max_tokens: 1500,
      system: SYSTEME,
      tools: [OUTIL],
      tool_choice: { type: "tool", name: OUTIL.name },
      messages: [{ role: "user", content: `${titre ? `Titre souhaité : ${titre.slice(0, 200)}\n` : ""}Notes : ${notes.slice(0, 3000)}` }],
    }),
    signal: AbortSignal.timeout(45000),
  }).catch(() => null);
  if (!res?.ok) return NextResponse.json({ erreur: "L'assistant ne répond pas pour le moment. Réessayez dans un instant." }, { status: 502 });
  const data = (await res.json()) as { content?: { type: string; input?: { titre?: string; texte?: string } }[] };
  const out = data.content?.find((c) => c.type === "tool_use")?.input;
  if (!out?.titre || !out?.texte) return NextResponse.json({ erreur: "Je n'ai pas réussi à rédiger, réessayez." }, { status: 502 });
  return NextResponse.json({ titre: out.titre.slice(0, 140), texte: out.texte.slice(0, 20000) });
}
