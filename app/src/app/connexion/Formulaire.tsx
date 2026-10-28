"use client";

import { useActionState, useEffect, useState } from "react";
import { connexion } from "./actions";

export function Formulaire() {
  const [etat, action, enCours] = useActionState(connexion, null);
  const [visible, setVisible] = useState(false);
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
      <div className="relative">
        <input
          id="motDePasse"
          name="motDePasse"
          type={visible ? "text" : "password"}
          required
          autoComplete="current-password"
          className="w-full border border-gris/40 bg-[#1b1b1b] py-3 pl-4 pr-14 text-blanc"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gris hover:text-blanc"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
            {visible && <path d="M3 3l18 18" />}
          </svg>
        </button>
      </div>
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
