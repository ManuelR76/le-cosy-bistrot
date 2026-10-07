import Link from "next/link";

/** Logo texte (police display), lien vers l'accueil — identique à l'origine. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`font-display text-[28px] leading-none text-blanc tab:text-[32px] ${className}`}>
      Le Cosy Bistrot
    </Link>
  );
}
