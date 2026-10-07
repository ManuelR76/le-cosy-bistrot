import type { Section } from "@/content/pages";
import { BordDechire } from "./BordDechire";
import { Bouton } from "./Bouton";
import { Diaporama } from "./Diaporama";

/** Section 2 colonnes : titre + filet rouge + texte (+ CTA) / diaporama 500 px à bords déchirés. */
export function SectionTexteDiaporama({ section }: { section: Section }) {
  return (
    <section className="conteneur grid items-center gap-8 py-[50px] tab:grid-cols-2 tab:gap-[50px] desk:py-[100px]">
      <div>
        <h2 className="titre-2 text-beige">{section.titre}</h2>
        <hr aria-hidden className="my-[10px] w-[100px] border-0 border-t border-rouge" />
        <div className="flex flex-col gap-[14.4px]">
          {section.paragraphes.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        {section.cta && <Bouton cta={section.cta} className="mt-5" />}
      </div>
      <div className="relative h-[300px] tab:h-[500px]">
        <Diaporama images={section.diaporama} sizes="(min-width: 768px) 50vw, 100vw" />
        <BordDechire couleur="noir" />
      </div>
    </section>
  );
}
