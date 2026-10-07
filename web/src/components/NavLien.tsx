"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLien({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  const actif = usePathname() === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={actif ? "page" : undefined}
      className={`font-accent text-[22px] leading-[22px] uppercase transition-colors hover:text-beige ${actif ? "text-beige" : "text-blanc"}`}
    >
      {children}
    </Link>
  );
}
