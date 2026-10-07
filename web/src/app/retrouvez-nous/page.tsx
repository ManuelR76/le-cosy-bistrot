import { CarteGoogle } from "@/components/CarteGoogle";
import { Horaires } from "@/components/Horaires";
import { IconeLieu, IconeTel } from "@/components/Icones";
import { SeoEdition } from "@/components/SeoEdition";
import { JsonLd } from "@/components/JsonLd";
import { ed } from "@/lib/edition/attrs";
import { getContenu } from "@/lib/edition/contenu";
import { graphe, meta } from "@/lib/seo";

export const revalidate = 60;
export async function generateMetadata() {
  const m = (await getContenu()).retrouvezNous.meta;
  return meta({ ...m, path: "/retrouvez-nous/" });
}

export default async function Page() {
  const { retrouvezNous: d, site } = await getContenu();
  return (
    <>
      <SeoEdition chemin="retrouvezNous.meta" title={d.meta.title} description={d.meta.description} />
      <JsonLd
        data={graphe({
          path: "/retrouvez-nous/",
          title: d.meta.title,
          description: d.meta.description,
          crumbs: [
            { name: "Accueil", path: "/" },
            { name: "Retrouvez-nous", path: "/retrouvez-nous/" },
          ],
        })}
      />
      <section className="grid gap-10 py-[50px] tab:grid-cols-[minmax(0,778px)_1fr] tab:gap-16 tab:pr-4 desk:pr-16">
        <CarteGoogle zoom={13} className="h-[400px] tab:h-[750px]" />
        <div className="px-4 tab:px-0 tab:pt-[59px]">
          <h1 className="titre-1" {...ed("retrouvezNous.titre")}>
            {d.titre}
          </h1>
          <p className="mt-5" {...ed("retrouvezNous.texte")}>
            {d.texte}
          </p>
          <ul className="mt-[34px] flex flex-col gap-5">
            <li>
              <a href={site.mapsFooter} target="_blank" rel="noopener" className="flex items-center gap-[10px] leading-4 hover:text-beige">
                <IconeLieu className="h-[25px] w-[25px] shrink-0" />
                <span {...ed("site.adresse")}>{site.adresse}</span>
              </a>
            </li>
            <li>
              <a href={site.telephoneHref} className="flex items-center gap-[10px] leading-4 hover:text-beige">
                <IconeTel className="h-[25px] w-[25px] shrink-0" />
                <span {...ed("site.telephone")}>{site.telephone}</span>
              </a>
            </li>
          </ul>
          <Horaires site={site} className="mt-5" />
        </div>
      </section>
    </>
  );
}
