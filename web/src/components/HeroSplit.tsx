import type { Cta, Image } from "@/content/pages";
import { Bouton } from "./Bouton";
import { Diaporama } from "./Diaporama";

type Props = {
  titre: string;
  sousTitre: string;
  paragraphes: string[];
  cta?: Cta;
  /** Accueil : diaporama + voile derrière un bloc de texte de 400 px centré. Pages offre : fond uni, texte 600 px. */
  fond?: Image[];
  haut: Image[];
  bas: Image[];
};

/**
 * Hero en deux colonnes, hauteur 75vh (min. 675 px desktop) comme l'existant.
 * Accueil : colonnes 50 % / reste, gouttière 20. Pages offre : retrait gauche 64, colonne droite 45,5 %.
 */
export function HeroSplit({ titre, sousTitre, paragraphes, cta, fond, haut, bas }: Props) {
  const accueil = Boolean(fond);
  return (
    <section
      className={`grid min-h-[609px] tab:min-h-[max(675px,75vh)] tab:gap-5 ${
        accueil ? "tab:grid-cols-[50%_1fr]" : "tab:grid-cols-[1fr_45.5vw] desk:pl-16"
      }`}
    >
      <div className={`relative flex items-center px-6 py-16 ${accueil ? "tab:justify-center tab:px-5" : "tab:px-6"}`}>
        {fond && <Diaporama images={fond} sizes="(min-width: 768px) 50vw, 100vw" priority voile />}
        <div className={`relative z-[1] ${accueil ? "tab:w-[400px]" : "max-w-[600px]"}`}>
          <h1 className="titre-1">{titre}</h1>
          <p className="titre-2 mt-[10px]">{sousTitre}</p>
          <div className="mt-5 flex flex-col gap-[14.4px] text-justify">
            {paragraphes.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {cta && <Bouton cta={cta} className="mt-5" />}
        </div>
      </div>
      <div className="hidden grid-rows-2 gap-5 tab:grid">
        <div className="relative min-h-[328px]">
          <Diaporama images={haut} sizes="50vw" priority />
        </div>
        <div className="relative min-h-[328px]">
          <Diaporama images={bas} sizes="50vw" />
        </div>
      </div>
    </section>
  );
}
