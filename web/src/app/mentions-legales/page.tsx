import { JsonLd } from "@/components/JsonLd";
import { getPageLegale } from "@/lib/content";
import { graphe, meta } from "@/lib/seo";

export const revalidate = 60;
const SLUG = "mentions-legales" as const;

export async function generateMetadata() {
  const p = await getPageLegale(SLUG);
  return meta({ title: p.title, description: p.description, path: `/${SLUG}/` });
}

export default async function Page() {
  const p = await getPageLegale(SLUG);
  return (
    <article className="mx-auto w-full max-w-[calc(var(--container-article)+2rem)] px-4 py-[30px]">
      <JsonLd
        data={graphe({
          path: `/${SLUG}/`,
          title: p.title,
          description: p.description,
          crumbs: [
            { name: "Accueil", path: "/" },
            { name: p.h1, path: `/${SLUG}/` },
          ],
        })}
      />
      <h1 className="titre-1 mb-6 text-rouge-vif">{p.h1}</h1>
      <div className="prose-cosy break-words" dangerouslySetInnerHTML={{ __html: p.html }} />
    </article>
  );
}
