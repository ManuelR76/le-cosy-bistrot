import Link from "next/link";
import type { Cta } from "@/content/pages";

export function Bouton({ cta, clair, className = "" }: { cta: Cta; clair?: boolean; className?: string }) {
  const cls = `btn ${clair ? "btn-clair" : ""} ${className}`;
  return cta.href.startsWith("/") ? (
    <Link href={cta.href} className={cls}>
      {cta.label}
    </Link>
  ) : (
    <a href={cta.href} className={cls}>
      {cta.label}
    </a>
  );
}
