import { BordDechire } from "@/components/BordDechire";
import { Bouton } from "@/components/Bouton";
import { CarteArticle } from "@/components/CarteArticle";
import { Diaporama } from "@/components/Diaporama";
import { BoutonAjoutActualite } from "@/components/EditeurActualites";
import { HeroSplit } from "@/components/HeroSplit";
import { Horaires } from "@/components/Horaires";
import { JsonLd } from "@/components/JsonLd";
import { getArticles } from "@/lib/content";
import { ed } from "@/lib/edition/attrs";
import { getContenu } from "@/lib/edition/contenu";
import { graphe, meta } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata() {
  const m = (await getContenu()).accueil.meta;
  return meta({ ...m, path: "/" });
}

export default async function Accueil() {
  const [articles, { accueil, site }] = await Promise.all([getArticles().then((a) => a.slice(0, 3)), getContenu()]);
  const { hero, horaires, menus, teasers, actualites } = accueil;

  return (
    <>
      <JsonLd data={graphe({ path: "/", title: accueil.meta.title, description: accueil.meta.description, crumbs: [{ name: "Accueil", path: "/" }] })} />

      <HeroSplit
        chemin="accueil.hero"
        titre={hero.titre}
        sousTitre={hero.sousTitre}
        paragraphes={hero.paragraphes}
        cta={hero.cta}
        fond={hero.fond}
        haut={hero.droiteHaut}
        bas={hero.droiteBas}
        cles={{ fond: "fond", haut: "droiteHaut", bas: "droiteBas" }}
      />

      {/* Horaires */}
      <section className="conteneur grid items-start gap-8 py-[50px] tab:grid-cols-2 tab:gap-[50px] desk:py-[100px]">
        <div>
          <h2 className="titre-2" {...ed("accueil.horaires.titre")}>
            {horaires.titre}
          </h2>
          <p className="mt-[10px]" {...ed("accueil.horaires.texte")}>
            {horaires.texte}
          </p>
          <Horaires site={site} className="mt-[34px]" />
          <Bouton cta={horaires.cta} chemin="accueil.horaires.cta.label" className="mt-5" />
        </div>
        <div className="relative h-[350px] tab:h-[608px]">
          <Diaporama images={horaires.diaporama} sizes="(min-width: 768px) 50vw, 100vw" chemin="accueil.horaires.diaporama" />
          <BordDechire couleur="noir" />
        </div>
      </section>

      {/* Menus et formules */}
      <section className="bg-rouge">
        <div className="conteneur grid grid-cols-[minmax(0,1fr)] gap-8 py-[50px] desk:grid-cols-[1fr_383px] desk:gap-5 desk:py-[100px]">
          <div>
            <h2 className="titre-1" {...ed("accueil.menus.titre")}>
              {menus.titre}
            </h2>
            <div className="mt-5 flex flex-col gap-[14.4px]">
              {menus.paragraphes.map((p, i) => (
                <p key={i} {...ed(`accueil.menus.paragraphes.${i}`)}>
                  {p}
                </p>
              ))}
            </div>
            <Bouton cta={menus.cta} chemin="accueil.menus.cta.label" clair className="mt-[34px]" />
          </div>
          <ul className="flex flex-col gap-5">
            {site.formules.map((f, i) => (
              <li key={i} className="relative flex items-center justify-between gap-[10px] bg-noir p-5">
                <div className="w-[250px] max-w-[70%] desk:max-w-none">
                  <h3 className="titre-2 text-beige" {...ed(`site.formules.${i}.titre`)}>
                    {f.titre}
                  </h3>
                  <p className="mt-[10px] font-accent text-[22px] leading-[22px] font-semibold" {...ed(`site.formules.${i}.detail`)}>
                    {f.detail}
                  </p>
                </div>
                <p className="w-[83px] shrink-0 text-right leading-4" {...ed(`site.formules.${i}.prix`)}>
                  {f.prix}
                </p>
                <BordDechire couleur="rouge" hauteur={15} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Privatisation / Événements */}
      <section className="conteneur grid gap-[50px] py-[50px] tab:grid-cols-2 desk:py-[100px]">
        {teasers.map((t, i) => (
          <article key={i} className="flex flex-col">
            <div className="relative h-[250px] tab:h-[350px]">
              <Diaporama images={t.diaporama} sizes="(min-width: 768px) 50vw, 100vw" chemin={`accueil.teasers.${i}.diaporama`} />
              <BordDechire couleur="noir" bas={false} />
            </div>
            <div className="relative flex flex-1 flex-col bg-rouge p-5 pb-[19px]">
              <h2 className="titre-2" {...ed(`accueil.teasers.${i}.titre`)}>
                {t.titre}
              </h2>
              <p className="mt-[10px]" {...ed(`accueil.teasers.${i}.texte`)}>
                {t.texte}
              </p>
              <Bouton cta={t.cta} chemin={`accueil.teasers.${i}.cta.label`} clair className="mt-[25px] self-start" />
              <BordDechire couleur="noir" haut={false} />
            </div>
          </article>
        ))}
      </section>

      {/* Actualités */}
      <section className="conteneur pb-[50px] desk:pb-[100px]">
        <h2 className="titre-1 mb-10" {...ed("accueil.actualites.titre")}>
          {actualites.titre}
        </h2>
        <BoutonAjoutActualite />
        <div className="grid gap-[50px] tab:grid-cols-2 desk:grid-cols-3">
          {articles.map((a) => (
            <CarteArticle key={a.slug} article={a} />
          ))}
        </div>
        <Bouton cta={actualites.cta} chemin="accueil.actualites.cta.label" clair className="mt-10" />
      </section>
    </>
  );
}
