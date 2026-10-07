import Link from "next/link";
import type { Cta } from "@/content/pages";
import { ed } from "@/lib/edition/attrs";

export function Bouton({ cta, clair, className = "", chemin }: { cta: Cta; clair?: boolean; className?: string; chemin?: string }) {
  const cls = `btn ${clair ? "btn-clair" : ""} ${className}`;
  const label = <span {...(chemin ? ed(chemin) : {})}>{cta.label}</span>;
  return cta.href.startsWith("/") ? (
    <Link href={cta.href} className={cls}>
      {label}
    </Link>
  ) : (
    <a href={cta.href} className={cls}>
      {label}
    </a>
  );
}
