import { NextResponse } from "next/server";
import { sessionValide } from "@/lib/edition/auth";

/**
 * Assistant en langage courant : transforme une demande (« passe la formule du samedi à 24,90 € »)
 * en propositions de modifications sur les seuls champs modifiables de la page.
 * Rien n'est enregistré ici : le client voit l'aperçu sur la page et valide avec « Enregistrer ».
 */
const CLE = /^(site|accueil|privatisation|evenement|leCosyBistrot|retrouvezNous|articles|legal)(\.[A-Za-z0-9]+){1,6}$/;
const MODELE = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

type Champ = { chemin: string; texte: string; role?: string };
type Message = { role: "user" | "assistant"; content: string };

const SYSTEME = `Tu es l'assistant d'édition du site du restaurant « Le Cosy Bistrot » (Bourg-Achard).
La personne qui t'écrit est la gérante ou son équipe : elle n'est pas technicienne. Réponds en français, brièvement et chaleureusement.

Tu reçois la liste des champs modifiables de la page ouverte (chemin, rôle, texte actuel) et sa demande.
Tu réponds TOUJOURS en appelant l'outil proposer_modifications.

Règles :
- Ne modifie que les champs listés, avec leur chemin exact. Ne crée jamais de chemin.
- Change le minimum nécessaire ; garde le ton, la longueur et la typographie existants (ex. prix au format « 21,90€ »).
- N'invente aucune information (prix, horaires, dates, noms) qui ne figure pas dans la demande.
- Si la demande est ambiguë ou concerne un élément absent de la liste (autre page, lien, mise en page, couleur), ne propose rien et explique en une ou deux phrases ce qui est possible.
- Pour une photo, explique qu'il suffit de cliquer sur « Changer les photos » sur la zone concernée.
- Ton message dit ce que tu as préparé et rappelle de cliquer sur « Enregistrer » pour publier.`;

const OUTIL = {
  name: "proposer_modifications",
  description: "Propose des modifications de texte sur les champs modifiables de la page.",
  input_schema: {
    type: "object",
    properties: {
      message: { type: "string", description: "Réponse courte à afficher à la personne." },
      modifications: {
        type: "array",
        items: {
          type: "object",
          properties: { chemin: { type: "string" }, valeur: { type: "string" } },
          required: ["chemin", "valeur"],
        },
      },
    },
    required: ["message", "modifications"],
  },
};

export async function POST(req: Request) {
  if (!(await sessionValide())) return NextResponse.json({ erreur: "Session expirée, reconnectez-vous." }, { status: 401 });
  const cle = process.env.ANTHROPIC_API_KEY;
  if (!cle) return NextResponse.json({ erreur: "L'assistant n'est pas encore activé (clé API manquante)." }, { status: 503 });

  const body = (await req.json().catch(() => null)) as { historique?: Message[]; champs?: Champ[]; page?: string } | null;
  const champs = (body?.champs ?? []).filter((c) => CLE.test(c.chemin)).slice(0, 200);
  const historique = (body?.historique ?? []).filter((m) => m && typeof m.content === "string").slice(-10);
  if (!historique.length || historique[historique.length - 1].role !== "user")
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });

  const contexte = `Page ouverte : ${body?.page ?? "?"}\nChamps modifiables (JSON) :\n${JSON.stringify(
    champs.map((c) => ({ chemin: c.chemin, role: c.role, texte: c.texte.slice(0, 1500) })),
  )}`;
  const messages = historique.map((m, i) =>
    i === historique.length - 1 ? { role: "user", content: `${contexte}\n\nDemande : ${m.content.slice(0, 2000)}` } : m,
  );

  const res = await fetch(`${process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com"}/v1/messages`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": cle, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: MODELE,
      max_tokens: 2000,
      system: SYSTEME,
      tools: [OUTIL],
      tool_choice: { type: "auto" },
      messages,
    }),
    signal: AbortSignal.timeout(45000),
  }).catch((e) => {
    console.error("[assistant] appel impossible", e);
    return null;
  });
  if (res && !res.ok) console.error("[assistant] API", res.status, (await res.text()).slice(0, 500));
  if (!res?.ok) return NextResponse.json({ erreur: "L'assistant ne répond pas pour le moment. Réessayez dans un instant." }, { status: 502 });

  const data = (await res.json()) as {
    content?: { type: string; text?: string; input?: { message?: string; modifications?: { chemin: string; valeur: string }[] } }[];
  };
  // tool_choice forcé non accepté par certains modèles : on laisse le modèle choisir et on retombe sur son texte.
  const texte = data.content?.filter((c) => c.type === "text" && c.text).map((c) => c.text).join("\n").trim();
  const sortie = data.content?.find((c) => c.type === "tool_use")?.input ?? (texte ? { message: texte, modifications: [] } : undefined);
  const autorises = new Set(champs.map((c) => c.chemin));
  const modifications = (sortie?.modifications ?? [])
    .filter((m) => autorises.has(m.chemin) && typeof m.valeur === "string" && m.valeur.length <= 5000)
    .slice(0, 30);
  return NextResponse.json({ message: sortie?.message ?? "Je n'ai pas compris, pouvez-vous reformuler ?", modifications });
}
