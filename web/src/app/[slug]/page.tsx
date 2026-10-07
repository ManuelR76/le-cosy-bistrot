import Image from "next/image";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { getArticle, getArticles } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
import { graphe, meta } from "@/lib/seo";
import { site } from "@/site.config";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getArticles()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">) {
  const a = await getArticle((await params).slug);
  if (!a) return {};
  return meta({
    title: a.title,
    description: a.description,
    path: `/${a.slug}/`,
    type: "article",
    image: a.image ? mediaUrl(a.image.src) : null,
    published: a.published,
    modified: a.modified,
  });
}

export default async function Article({ params }: PageProps<"/[slug]">) {
  const a = await getArticle((await params).slug);
  if (!a) notFound();
  const path = `/${a.slug}/`;
  const url = site.url + path;

  return (
    <article className="mx-auto w-full max-w-[calc(var(--container-article)+2rem)] px-4 pt-2 pb-[30px]">
      <JsonLd
        data={graphe({
          path,
          title: a.title,
          description: a.description,
          crumbs: [
            { name: "Accueil", path: "/" },
            { name: a.category || "Articles", path: "/articles/" },
            { name: a.h1, path },
          ],
          extra: [
            {
              "@type": "BlogPosting",
              "@id": `${url}#blogposting`,
              headline: a.h1,
              description: a.description,
              datePublished: a.published,
              dateModified: a.modified,
              inLanguage: "fr-FR",
              articleSection: a.category || undefined,
              mainEntityOfPage: { "@id": `${url}#webpage` },
              publisher: { "@id": `${site.url}/#organization` },
              author: { "@id": `${site.url}/#organization` },
              ...(a.image ? { image: { "@type": "ImageObject", url: mediaUrl(a.image.src) } } : {}),
            },
          ],
        })}
      />
      <h1 className="titre-1 mb-4 text-rouge-vif">{a.h1}</h1>
      {a.image && (
        <Image
          src={mediaUrl(a.image.src)}
          alt={a.image.alt}
          width={600}
          height={400}
          sizes="(min-width: 640px) 600px, 100vw"
          preload
          loading="eager"
          className="mb-4 h-auto w-full max-w-[600px]"
        />
      )}
      <div className="prose-cosy" dangerouslySetInnerHTML={{ __html: a.html }} />
    </article>
  );
}
