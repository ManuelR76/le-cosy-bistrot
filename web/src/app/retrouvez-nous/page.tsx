import { CarteGoogle } from "@/components/CarteGoogle";
import { Horaires } from "@/components/Horaires";
import { IconeLieu, IconeTel } from "@/components/Icones";
import { JsonLd } from "@/components/JsonLd";
import { retrouvezNous as d } from "@/content/pages";
import { graphe, meta } from "@/lib/seo";
import { site } from "@/site.config";

export const metadata = meta({ ...d.meta, path: "/retrouvez-nous/" });

export default function Page() {
  return (
    <>
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
          <h1 className="titre-1">{d.titre}</h1>
          <p className="mt-5">{d.texte}</p>
          <ul className="mt-5 flex flex-col gap-5">
            <li>
              <a href={site.mapsFooter} target="_blank" rel="noopener" className="flex items-center gap-4 hover:text-beige">
                <IconeLieu className="h-[25px] w-[25px] shrink-0" />
                {site.adresse}
              </a>
            </li>
            <li>
              <a href={site.telephoneHref} className="flex items-center gap-4 hover:text-beige">
                <IconeTel className="h-[25px] w-[25px] shrink-0" />
                {site.telephone}
              </a>
            </li>
          </ul>
          <Horaires className="mt-5" />
        </div>
      </section>
    </>
  );
}
