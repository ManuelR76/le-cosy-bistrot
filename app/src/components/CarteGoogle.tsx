"use client";

import { setConsent, useConsent } from "./consent";
import { site } from "@/site.config";

type Props = { zoom?: number; className?: string; titre?: string };

/** Iframe Google Maps d'origine, affichée après consentement (dépose des cookies tiers). */
export function CarteGoogle({ zoom = 14, className = "h-[300px]", titre = "Carte : Le Cosy Bistrot à Bourg-Achard" }: Props) {
  const consent = useConsent();
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(site.mapsEmbedQuery)}&t=m&z=${zoom}&output=embed&iwloc=near`;
  if (consent === "granted") {
    return <iframe src={src} title={titre} loading="lazy" className={`w-full border-0 ${className}`} />;
  }
  return (
    <div className={`flex w-full flex-col items-center justify-center gap-3 bg-[#1b1b1b] p-6 text-center ${className}`}>
      <p className="text-sm">{site.adresse}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => setConsent("granted")} className="btn text-[18px]">
          Afficher la carte
        </button>
        <a href={site.mapsFooter} target="_blank" rel="noopener" className="btn btn-clair text-[18px]">
          Ouvrir dans Maps
        </a>
      </div>
    </div>
  );
}
