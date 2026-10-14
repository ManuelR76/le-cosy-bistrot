"use server";

import { motDePasseValide, ouvrirSession } from "@/lib/edition/auth";

export async function connexion(_: unknown, form: FormData) {
  await new Promise((r) => setTimeout(r, 600)); // freine les essais en rafale
  if (!motDePasseValide(String(form.get("motDePasse") ?? ""))) return { erreur: "Mot de passe incorrect." } as const;
  await ouvrirSession();
  return { ok: true as const };
}

