import Link from "next/link";
import { ed } from "@/lib/edition/attrs";
import { getContenu } from "@/lib/edition/contenu";
import { CarteGoogle } from "./CarteGoogle";
import { GestionCookies } from "./GestionCookies";
import { IconeLieu, IconeTel } from "./Icones";
import { Logo } from "./Logo";

export async function Footer() {
  const { site } = await getContenu();
  return (
    <footer className="mt-auto">
      <div className="conteneur grid gap-10 py-16 tab:grid-cols-2 desk:grid-cols-[364px_414px_1fr] desk:gap-0 desk:py-[50px] desk:[&>*:nth-child(2)]:pl-[50px]">
        <div className="flex flex-col gap-5">
          <Logo />
          <a href={site.mapsFooter} target="_blank" rel="noopener" className="flex items-center gap-3 hover:text-beige">
            <IconeLieu className="h-[18px] w-[18px] shrink-0" />
            <span {...ed("site.adresse")}>{site.adresse}</span>
          </a>
          <a href={site.telephoneHref} className="flex items-center gap-3 hover:text-beige">
            <IconeTel className="h-[18px] w-[18px] shrink-0" />
            <span {...ed("site.telephone")}>{site.telephone}</span>
          </a>
        </div>
        <div>
          <p className="titre-2 mb-5 text-blanc">Plan du site</p>
          <ul className="flex flex-col gap-2">
            {site.planDuSite.map((l) => (
              <li key={l.href} className="flex items-center gap-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-blanc">
                <Link href={l.href} className="hover:text-beige">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <CarteGoogle className="h-[300px] tab:col-span-2 desk:col-span-1" />
      </div>
      <div className="conteneur flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-4 text-sm">
        <Link href="/" className="hover:text-beige">
          © {new Date().getFullYear()} Tous droits réservés Le Cosy Bistrot
        </Link>
        <a href={site.credit.href} target="_blank" rel="noopener" className="hover:text-beige">
          {site.credit.label}
        </a>
        {site.legal.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-beige" prefetch={l.href.endsWith(".xml") ? false : undefined}>
            {l.label}
          </Link>
        ))}
        <GestionCookies />
      </div>
    </footer>
  );
}
