"use client";

import Link from "next/link";
import { setConsent, useConsent } from "./consent";

export function BandeauCookies() {
  const consent = useConsent();
  if (consent !== null) return null;
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookies-titre"
      className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-rouge bg-noir/95 px-4 py-4 shadow-[0_-8px_24px_rgba(0,0,0,.5)]"
    >
      <div className="mx-auto flex max-w-[1297px] flex-col gap-4 tab:flex-row tab:items-center tab:justify-between">
        <p id="cookies-titre" className="text-sm">
          Nous utilisons des cookies de mesure d’audience (Google Analytics) et la carte Google Maps uniquement avec
          votre accord.{" "}
          <Link href="/politique-de-confidentialite/" className="text-beige underline">
            En savoir plus
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <button type="button" onClick={() => setConsent("denied")} className="btn btn-clair text-[18px]">
            Refuser
          </button>
          <button type="button" onClick={() => setConsent("granted")} className="btn text-[18px]">
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
