import Link from "next/link";

/** Logo texte (police display), lien vers l'accueil — identique à l'origine. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`font-display text-[28px] leading-none text-blanc desk:text-[48px] ${className}`}>
      Le Cosy Bistrot
    </Link>
  );
}
