import { CarteArticle } from "@/components/CarteArticle";
import { JsonLd } from "@/components/JsonLd";
import { getArticles } from "@/lib/content";
import { graphe, meta } from "@/lib/seo";

export const revalidate = 60;

const TITLE = "Articles - Le Cosy Bistrot";
// L'archive d'origine n'a pas de meta description (AIOSEO) : TODO(contenu) à rédiger.
const DESCRIPTION = "";

export const metadata = meta({ title: TITLE, description: DESCRIPTION, path: "/articles/" });

export default async function Page() {
  const articles = await getArticles();
  return (
    <>
      <JsonLd
        data={graphe({
          path: "/articles/",
          title: TITLE,
          description: DESCRIPTION,
          crumbs: [
            { name: "Accueil", path: "/" },
            { name: "Articles", path: "/articles/" },
          ],
        })}
      />
      <section className="conteneur py-[50px] desk:py-[100px]">
        <h1 className="titre-1 mb-10">Articles</h1>
        <div className="grid gap-[50px] tab:grid-cols-2 desk:grid-cols-3">
          {articles.map((a) => (
            <CarteArticle key={a.slug} article={a} titreNiveau={2} />
          ))}
        </div>
      </section>
    </>
  );
}
