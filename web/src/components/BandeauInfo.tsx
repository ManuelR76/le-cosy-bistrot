import { dansPeriode } from "@/lib/edition/dates";
import { lireBandeau } from "@/lib/edition/store";
import { PopupAccueil } from "./PopupAccueil";

const lien = (href: string) => (href.startsWith("/") ? {} : href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {});

/** Bandeau d'information géré par le client : en tête du site, ou pop-up à l'ouverture de l'accueil. */
export async function BandeauInfo() {
  const b = await lireBandeau();
  if (!b.actif || !b.texte || !dansPeriode(b.debut, b.fin)) return null;

  if (b.affichage === "popup") return <PopupAccueil texte={b.texte} lien={b.lien} important={b.style === "important"} version={b.version} />;

  return (
    <div role="region" aria-label="Information" className={`${b.style === "important" ? "bg-rouge text-blanc" : "bg-beige text-noir"} px-4 py-2 text-center text-[16px] leading-snug`}>
      <p className="mx-auto max-w-[1297px]">
        {b.texte}
        {b.lien && (
          <>
            {" "}
            <a href={b.lien.href} {...lien(b.lien.href)} className="font-bold underline underline-offset-2">
              {b.lien.label}
            </a>
          </>
        )}
      </p>
    </div>
  );
}
