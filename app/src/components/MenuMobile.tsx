"use client";

import { useEffect, useState } from "react";
import { site } from "@/site.config";
import { IconeFermer, IconeMenu } from "./Icones";
import { NavLien } from "./NavLien";

export function MenuMobile() {
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    if (!ouvert) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ouvert]);

  return (
    <div className="desk:hidden">
      <button
        type="button"
        aria-expanded={ouvert}
        aria-controls="menu-mobile"
        aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"}
        onClick={() => setOuvert((o) => !o)}
        className="flex h-[42px] w-[42px] items-center justify-center bg-rouge text-blanc"
      >
        {ouvert ? <IconeFermer className="h-6 w-6" /> : <IconeMenu className="h-6 w-6" />}
      </button>
      <nav
        id="menu-mobile"
        aria-label="Navigation mobile"
        hidden={!ouvert}
        className="absolute inset-x-0 top-full border-t border-rouge bg-noir"
      >
        <ul className="conteneur flex flex-col gap-5 py-6">
          {site.nav.map((l) => (
            <li key={l.href}>
              <NavLien href={l.href} onClick={() => setOuvert(false)}>
                {l.label}
              </NavLien>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
