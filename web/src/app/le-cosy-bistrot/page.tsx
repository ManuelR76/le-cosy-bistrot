import { Carrousel } from "@/components/Carrousel";
import { JsonLd } from "@/components/JsonLd";
import { Media } from "@/components/Media";
import { leCosyBistrot as d, type Bloc } from "@/content/pages";
import { graphe, meta } from "@/lib/seo";

export const metadata = meta({ ...d.meta, path: "/le-cosy-bistrot/" });

function Blocs({ blocs }: { blocs: Bloc[] }) {
  return (
    <div className="flex flex-col gap-[14.4px]">
      {blocs.map((b) =>
        b.type === "h2" ? (
          <h2 key={b.texte} className="text-base font-bold">
            {b.texte}
          </h2>
        ) : b.type === "strong" ? (
          <p key={b.texte}>
            <strong>{b.texte}</strong>
          </p>
        ) : (
          <p key={b.texte}>{b.texte}</p>
        ),
      )}
    </div>
  );
}

export default function Page() {
  return (
    <>
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
      <section className="grid items-center gap-8 tab:grid-cols-[minmax(0,778px)_1fr] tab:gap-16 tab:pr-4 desk:pr-16">
        <div className="relative aspect-[3/2] w-full">
          <Media src={d.image.src} alt={d.image.alt} sizes="(min-width: 768px) 55vw, 100vw" priority />
        </div>
        <div className="px-4 pb-8 tab:px-0 tab:py-10">
          <h1 className="titre-1">{d.titre}</h1>
          <p className="titre-2 mt-[10px] mb-5">{d.sousTitre}</p>
          <Blocs blocs={d.blocs} />
        </div>
      </section>
      <section className="conteneur py-[50px] desk:py-[100px]">
        <Blocs blocs={d.suite} />
      </section>
      <Carrousel images={d.galerie} label="Photos du Cosy Bistrot" />
    </>
  );
}
