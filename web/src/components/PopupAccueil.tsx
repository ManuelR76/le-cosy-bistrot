"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Props = { texte: string; lien: { label: string; href: string } | null; important: boolean; version: number };

/** Pop-up d'information : s'ouvre à l'arrivée sur l'accueil, une fois par visite (jusqu'à fermeture du navigateur). */
export function PopupAccueil({ texte, lien, important, version }: Props) {
  const accueil = usePathname() === "/";
  const [ouvert, setOuvert] = useState(false);
  const fermer = useRef<HTMLButtonElement>(null);
  const cle = `cosy-popup-${version}`;

  useEffect(() => {
    if (!accueil) return setOuvert(false);
    let deja = false;
    try {
      deja = sessionStorage.getItem(cle) === "1";
    } catch {}
    // En mode édition, le pop-up ne gêne pas : il s'ouvre seulement via « Voir le pop-up » (?popup=1).
    const edition = document.cookie.split("; ").includes("cosy-edition=1");
    const apercu = new URLSearchParams(window.location.search).get("popup") === "1";
    if (edition && !apercu) return;
    if (deja && !apercu) return;
    const t = window.setTimeout(() => setOuvert(true), 700);
    return () => window.clearTimeout(t);
  }, [accueil, cle]);

  useEffect(() => {
    if (!ouvert) return;
    const avant = document.activeElement as HTMLElement | null;
    fermer.current?.focus();
    const echap = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", echap);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", echap);
      document.body.style.overflow = overflow;
      avant?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ouvert]);

  function close() {
    try {
      sessionStorage.setItem(cle, "1");
    } catch {}
    setOuvert(false);
  }

  if (!ouvert) return null;
  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/70 p-4" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-info-titre"
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-[520px] border-t-4 ${important ? "border-rouge" : "border-beige"} bg-noir px-6 pt-8 pb-7 shadow-2xl`}
      >
        <button ref={fermer} type="button" onClick={close} aria-label="Fermer" className="absolute top-2 right-3 p-2 text-[28px] leading-none text-gris hover:text-blanc">
          ×
        </button>
        <p id="popup-info-titre" className="font-accent text-[26px] leading-tight uppercase">
          Information
        </p>
        <p className="mt-3 text-[18px] leading-relaxed">{texte}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {lien && (
            <a href={lien.href} onClick={close} className="btn text-[18px]">
              {lien.label}
            </a>
          )}
          <button type="button" onClick={close} className="btn btn-clair text-[18px]">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
