"use client";

import { useActionState, useEffect } from "react";
import { connexion } from "./actions";

export function Formulaire() {
  const [etat, action, enCours] = useActionState(connexion, null);
  // Rechargement complet : le mode édition s'active au chargement de la page.
  useEffect(() => {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- rechargement complet voulu
    if (etat && "ok" in etat) window.location.href = "/";
  }, [etat]);
  return (
    <form action={action} className="mt-8 flex flex-col gap-4">
      <label htmlFor="motDePasse" className="font-accent text-[22px]">
        Mot de passe
      </label>
      <input
        id="motDePasse"
        name="motDePasse"
        type="password"
        required
        autoComplete="current-password"
        className="border border-gris/40 bg-[#1b1b1b] px-4 py-3 text-blanc"
      />
      {etat && "erreur" in etat && (
        <p role="alert" className="text-beige">
          {etat.erreur}
        </p>
      )}
      <button type="submit" disabled={enCours} className="btn self-start disabled:opacity-60">
        {enCours ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
