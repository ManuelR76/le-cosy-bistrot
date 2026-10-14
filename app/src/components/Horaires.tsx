import { ed } from "@/lib/edition/attrs";
import type { SiteContenu } from "@/lib/edition/contenu";

export function Horaires({ site, className = "" }: { site: SiteContenu; className?: string }) {
  return (
    <ul className={`flex flex-col gap-[25px] ${className}`}>
      {site.horaires.map((h, i) => (
        <li key={i} className="flex items-center gap-2">
          <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-blanc" />
          <span>
            <span {...ed(`site.horaires.${i}.jour`)}>{h.jour}</span> : <span {...ed(`site.horaires.${i}.texte`)}>{h.texte}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
