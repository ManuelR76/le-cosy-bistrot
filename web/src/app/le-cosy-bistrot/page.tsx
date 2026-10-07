import { Carrousel } from "@/components/Carrousel";
import { SeoEdition } from "@/components/SeoEdition";
import { JsonLd } from "@/components/JsonLd";
import { Media } from "@/components/Media";
import { type Bloc } from "@/content/pages";
import { ed, edPhotos } from "@/lib/edition/attrs";
import { getContenu } from "@/lib/edition/contenu";
import { graphe, meta } from "@/lib/seo";

export const revalidate = 60;
export async function generateMetadata() {
  const m = (await getContenu()).leCosyBistrot.meta;
  return meta({ ...m, path: "/le-cosy-bistrot/" });
}

function Blocs({ blocs, chemin, colonnes }: { blocs: Bloc[]; chemin: string; colonnes?: boolean }) {
  return (
    <div className={colonnes ? "tab:columns-2 tab:gap-16 [&>*]:mb-[14.4px] [&>*]:break-inside-avoid" : "flex flex-col gap-[14.4px]"}>
      {blocs.map((b, i) => {
        const attrs = ed(`${chemin}.${i}.texte`);
        return b.type === "h2" ? (
          <h2 key={i} className="titre-2 mt-2 mb-[16px]! break-after-avoid" {...attrs}>
            {b.texte}
          </h2>
        ) : b.type === "strong" ? (
          <p key={i}>
            <strong {...attrs}>{b.texte}</strong>
          </p>
        ) : (
          <p key={i} {...attrs}>
            {b.texte}
          </p>
        );
      })}
    </div>
  );
}

export default async function Page() {
  const d = (await getContenu()).leCosyBistrot;
  return (
    <>
      <SeoEdition chemin="leCosyBistrot.meta" title={d.meta.title} description={d.meta.description} />
      <JsonLd
        data={graphe({
          path: "/le-cosy-bistrot/",
          title: d.meta.title,
          description: d.meta.description,
          crumbs: [
            { name: "Accueil", path: "/" },
            { name: "Le Cosy Bistrot", path: "/le-cosy-bistrot/" },
          ],
        })}
      />
      <section className="grid items-center gap-8 tab:grid-cols-[54.6vw_1fr] tab:gap-16 tab:pr-4 desk:pr-16">
        <div className="relative aspect-[3/2] w-full" {...edPhotos("leCosyBistrot.image", [d.image], true)}>
          <Media src={d.image.src} alt={d.image.alt} sizes="(min-width: 768px) 55vw, 100vw" priority />
        </div>
        <div className="px-4 pb-8 tab:px-0 tab:py-10">
          <h1 className="titre-1" {...ed("leCosyBistrot.titre")}>
            {d.titre}
          </h1>
          <p className="titre-2 mt-[10px] mb-5" {...ed("leCosyBistrot.sousTitre")}>
            {d.sousTitre}
          </p>
          <Blocs blocs={d.blocs} chemin="leCosyBistrot.blocs" />
        </div>
      </section>
      {/* Texte sur deux colonnes CSS (gouttière 64 px), comme le bloc Elementor d'origine */}
      <section className="conteneur py-[50px] desk:py-[100px]">
        <Blocs blocs={d.suite} chemin="leCosyBistrot.suite" colonnes />
      </section>
      <Carrousel images={d.galerie} label="Photos du Cosy Bistrot" chemin="leCosyBistrot.galerie" />
    </>
  );
}
