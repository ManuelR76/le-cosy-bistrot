import { JsonLd } from "@/components/JsonLd";
import { getPageLegale } from "@/lib/content";
import { graphe, meta } from "@/lib/seo";
import { ed } from "@/lib/edition/attrs";

export const revalidate = 60;
const SLUG = "mentions-legales" as const;

export async function generateMetadata() {
  const p = await getPageLegale(SLUG);
  return meta({ title: p.title, description: p.description, path: `/${SLUG}/` });
}

export default async function Page() {
  const p = await getPageLegale(SLUG);
  return (
    <article className="mx-auto w-full max-w-[calc(var(--container-article)+2rem)] px-4 pt-2 pb-[30px]">
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
      <h1 className="titre-1 mb-4 text-rouge-vif" {...ed(`${p.edition}.titre`)}>
        {p.h1}
      </h1>
      <div className="prose-cosy break-words" dangerouslySetInnerHTML={{ __html: p.html }} />
    </article>
  );
}
