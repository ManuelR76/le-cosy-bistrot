import type { PageOffre as Data } from "@/content/pages";
import { graphe } from "@/lib/seo";
import { Carrousel } from "./Carrousel";
import { HeroSplit } from "./HeroSplit";
import { JsonLd } from "./JsonLd";
import { SeoEdition } from "./SeoEdition";
import { SectionTexteDiaporama } from "./SectionTexteDiaporama";

export function PageOffre({ data, cle, path, crumb }: { data: Data; cle: "privatisation" | "evenement"; path: string; crumb: string }) {
  return (
    <>
      <JsonLd
        data={graphe({
          path,
          title: data.meta.title,
          description: data.meta.description,
          crumbs: [
            { name: "Accueil", path: "/" },
            { name: crumb, path },
          ],
        })}
      />
      <SeoEdition chemin={`${cle}.meta`} title={data.meta.title} description={data.meta.description} />
      <HeroSplit chemin={`${cle}.hero`} {...data.hero} />
      {data.sections.map((s, i) => (
        <SectionTexteDiaporama key={i} section={s} chemin={`${cle}.sections.${i}`} />
      ))}
      <Carrousel images={data.galerie} label={`Photos : ${crumb}`} chemin={`${cle}.galerie`} />
    </>
  );
}
