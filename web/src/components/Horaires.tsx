import { site } from "@/site.config";

export function Horaires({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-col gap-[12.5px] ${className}`}>
      {site.horaires.map((h) => (
        <li key={h.jour} className="flex items-center gap-2">
          <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-blanc" />
          <span>
            {h.jour} : {h.texte}
          </span>
        </li>
      ))}
    </ul>
  );
}
