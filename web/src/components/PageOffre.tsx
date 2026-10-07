import type { PageOffre as Data } from "@/content/pages";
import { Carrousel } from "./Carrousel";
import { HeroSplit } from "./HeroSplit";
import { JsonLd } from "./JsonLd";
import { SectionTexteDiaporama } from "./SectionTexteDiaporama";
import { graphe } from "@/lib/seo";

export function PageOffre({ data, path, crumb }: { data: Data; path: string; crumb: string }) {
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
      <HeroSplit {...data.hero} />
      {data.sections.map((s) => (
        <SectionTexteDiaporama key={s.titre} section={s} />
      ))}
      <Carrousel images={data.galerie} label={`Photos : ${crumb}`} />
    </>
  );
}
