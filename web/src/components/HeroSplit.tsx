import type { Cta, Image } from "@/content/pages";
import { ed } from "@/lib/edition/attrs";
import { Bouton } from "./Bouton";
import { Diaporama } from "./Diaporama";

type Props = {
  /** Chemin du contenu (« accueil.hero », « privatisation.hero »). */
  chemin: string;
  titre: string;
  sousTitre: string;
  paragraphes: string[];
  cta?: Cta;
  /** Accueil : diaporama + voile derrière un bloc de texte de 400 px centré. Pages offre : fond uni, texte 600 px. */
  fond?: Image[];
  haut: Image[];
  bas: Image[];
  cles?: { fond?: string; haut: string; bas: string };
};

/**
 * Hero en deux colonnes, hauteur 75vh (min. 675 px desktop) comme l'existant.
 * Accueil : colonnes 50 % / reste, gouttière 20. Pages offre : retrait gauche 64, colonne droite 45,5vw.
 */
export function HeroSplit({ chemin, titre, sousTitre, paragraphes, cta, fond, haut, bas, cles = { fond: "fond", haut: "haut", bas: "bas" } }: Props) {
  const accueil = Boolean(fond);
  return (
    <section
      className={`grid min-h-[609px] tab:min-h-[max(675px,75vh)] tab:gap-5 ${
        accueil ? "tab:grid-cols-[50%_1fr]" : "tab:grid-cols-[1fr_45.5vw] desk:pl-16"
      }`}
    >
      <div className={`relative flex items-center px-6 py-16 ${accueil ? "tab:justify-center tab:px-5" : "tab:px-6"}`}>
        {fond && <Diaporama images={fond} sizes="(min-width: 768px) 50vw, 100vw" priority voile chemin={`${chemin}.${cles.fond}`} />}
        <div className={`relative z-[1] ${accueil ? "tab:w-[400px]" : "max-w-[600px]"}`}>
          <h1 className="titre-1" {...ed(`${chemin}.titre`)}>
            {titre}
          </h1>
          <p className="titre-2 mt-[10px]" {...ed(`${chemin}.sousTitre`)}>
            {sousTitre}
          </p>
          <div className={`flex flex-col gap-[14.4px] text-justify ${accueil ? "mt-[10px]" : "mt-5"}`}>
            {paragraphes.map((p, i) => (
              <p key={i} {...ed(`${chemin}.paragraphes.${i}`)}>
                {p}
              </p>
            ))}
          </div>
          {cta && <Bouton cta={cta} chemin={`${chemin}.cta.label`} className={accueil ? "mt-[25px]" : "mt-[34px]"} />}
        </div>
      </div>
      <div className="hidden grid-rows-2 gap-5 tab:grid">
        <div className="relative min-h-[328px]">
          <Diaporama images={haut} sizes="50vw" priority chemin={`${chemin}.${cles.haut}`} />
        </div>
        <div className="relative min-h-[328px]">
          <Diaporama images={bas} sizes="50vw" chemin={`${chemin}.${cles.bas}`} />
        </div>
      </div>
    </section>
  );
}
