import type { Cta, Image } from "@/content/pages";
import { Bouton } from "./Bouton";
import { Diaporama } from "./Diaporama";

type Props = {
  titre: string;
  sousTitre: string;
  paragraphes: string[];
  cta?: Cta;
  /** Accueil : diaporama + voile derrière le texte. Pages offre : fond uni. */
  fond?: Image[];
  haut: Image[];
  bas: Image[];
};

/** Hero en deux colonnes : texte à gauche, deux diaporamas empilés à droite (masqués en mobile). */
export function HeroSplit({ titre, sousTitre, paragraphes, cta, fond, haut, bas }: Props) {
  return (
    <section className="grid min-h-[609px] tab:min-h-[675px] tab:grid-cols-2 tab:gap-5">
      <div className="relative flex items-center px-6 py-16 tab:px-5 desk:pl-[88px]">
        {fond && <Diaporama images={fond} sizes="(min-width: 768px) 50vw, 100vw" priority voile />}
        <div className="relative z-[1] max-w-[600px]">
          <h1 className="titre-1">{titre}</h1>
          <p className="titre-2 mt-[10px]">{sousTitre}</p>
          <div className="mt-5 flex flex-col gap-[14.4px] text-justify tab:text-left">
            {paragraphes.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {cta && <Bouton cta={cta} className="mt-5" />}
        </div>
      </div>
      <div className="hidden grid-rows-2 gap-5 tab:grid">
        <div className="relative min-h-[328px]">
          <Diaporama images={haut} sizes="50vw" />
        </div>
        <div className="relative min-h-[328px]">
          <Diaporama images={bas} sizes="50vw" />
        </div>
      </div>
    </section>
  );
}
