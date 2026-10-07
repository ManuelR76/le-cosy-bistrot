import { BordDechire } from "@/components/BordDechire";
import { Bouton } from "@/components/Bouton";
import { CarteArticle } from "@/components/CarteArticle";
import { Diaporama } from "@/components/Diaporama";
import { HeroSplit } from "@/components/HeroSplit";
import { Horaires } from "@/components/Horaires";
import { JsonLd } from "@/components/JsonLd";
import { accueil } from "@/content/pages";
import { getArticles } from "@/lib/content";
import { graphe, meta } from "@/lib/seo";
import { site } from "@/site.config";

export const revalidate = 60;

export const metadata = meta({ title: accueil.meta.title, description: accueil.meta.description, path: "/" });

export default async function Accueil() {
  const articles = (await getArticles()).slice(0, 3);
  const { hero, horaires, menus, teasers, actualites } = accueil;

  return (
    <>
      <JsonLd data={graphe({ path: "/", title: accueil.meta.title, description: accueil.meta.description, crumbs: [{ name: "Accueil", path: "/" }] })} />

      <HeroSplit titre={hero.titre} sousTitre={hero.sousTitre} paragraphes={hero.paragraphes} cta={hero.cta} fond={hero.fond} haut={hero.droiteHaut} bas={hero.droiteBas} />

      {/* Horaires */}
      <section className="conteneur grid items-center gap-8 py-[50px] tab:grid-cols-2 tab:gap-[50px] desk:py-[100px]">
        <div>
          <h2 className="titre-2">{horaires.titre}</h2>
          <p className="mt-5">{horaires.texte}</p>
          <Horaires className="mt-5" />
          <Bouton cta={horaires.cta} className="mt-6" />
        </div>
        <div className="relative h-[350px] tab:h-[608px]">
          <Diaporama images={horaires.diaporama} sizes="(min-width: 768px) 50vw, 100vw" />
          <BordDechire couleur="noir" />
        </div>
      </section>

      {/* Menus et formules */}
      <section className="bg-rouge">
        <div className="conteneur grid gap-8 py-[50px] desk:grid-cols-[1fr_383px] desk:gap-[50px] desk:py-[100px]">
          <div>
            <h2 className="titre-2">{menus.titre}</h2>
            <div className="mt-5 flex flex-col gap-[14.4px]">
              {menus.paragraphes.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <Bouton cta={menus.cta} clair className="mt-6" />
          </div>
          <ul className="flex flex-col gap-5">
            {site.formules.map((f) => (
              <li key={f.titre} className="relative flex items-center justify-between gap-4 bg-noir px-5 py-8">
                <div>
                  <h3 className="titre-2 text-beige">{f.titre}</h3>
                  <p className="mt-2 font-accent text-[20px] leading-none uppercase">{f.detail}</p>
                </div>
                <p className="shrink-0">{f.prix}</p>
                <BordDechire couleur="rouge" hauteur={15} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Privatisation / Événements */}
      <section className="conteneur grid gap-[50px] py-[50px] tab:grid-cols-2 desk:py-[100px]">
        {teasers.map((t) => (
          <article key={t.titre} className="flex flex-col">
            <div className="relative h-[250px] tab:h-[350px]">
              <Diaporama images={t.diaporama} sizes="(min-width: 768px) 50vw, 100vw" />
              <BordDechire couleur="noir" bas={false} />
            </div>
            <div className="relative flex flex-1 flex-col gap-4 bg-rouge p-5 pb-10">
              <h2 className="titre-2">{t.titre}</h2>
              <p>{t.texte}</p>
              <Bouton cta={t.cta} clair className="self-start" />
              <BordDechire couleur="noir" haut={false} />
            </div>
          </article>
        ))}
      </section>

      {/* Actualités */}
      <section className="conteneur pb-[50px] desk:pb-[100px]">
        <h2 className="titre-2 mb-8">{actualites.titre}</h2>
        <div className="grid gap-[50px] tab:grid-cols-2 desk:grid-cols-3">
          {articles.map((a) => (
            <CarteArticle key={a.slug} article={a} />
          ))}
        </div>
        <Bouton cta={actualites.cta} clair className="mt-10" />
      </section>
    </>
  );
}
