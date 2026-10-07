import Link from "next/link";
import type { Article } from "@/lib/content";
import { BordDechire } from "./BordDechire";
import { Media } from "./Media";

export function CarteArticle({ article, titreNiveau = 3 }: { article: Article; titreNiveau?: 2 | 3 }) {
  const href = `/${article.slug}/`;
  const T = `h${titreNiveau}` as const;
  return (
    <article className="flex flex-col">
      <div className="relative h-[260px]">
        {article.image && <Media src={article.image.src} alt={article.image.alt} sizes="(min-width: 1025px) 400px, (min-width: 768px) 50vw, 100vw" />}
        <BordDechire couleur="noir" bas={false} />
      </div>
      <div className="relative flex flex-1 flex-col gap-4 bg-rouge p-5 pb-10">
        <T className="titre-2">
          <Link href={href} className="hover:text-beige">
            {article.h1}
          </Link>
        </T>
        <p className="text-justify">{article.extrait}</p>
        <Link href={href} className="btn btn-clair self-start" aria-label={`Lire l'article : ${article.h1}`}>
          Lire l&apos;article
        </Link>
        <BordDechire couleur="noir" haut={false} />
      </div>
    </article>
  );
}
