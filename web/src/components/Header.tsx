import { site } from "@/site.config";
import { IconeLieu, IconeTel } from "./Icones";
import { Logo } from "./Logo";
import { MenuMobile } from "./MenuMobile";
import { NavLien } from "./NavLien";

export function Header() {
  return (
    <>
      <a href="#contenu" className="sr-only z-[60] bg-rouge px-4 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Aller au contenu
      </a>
      {/* Barre d'informations (34 px desktop) */}
      <aside aria-label="Coordonnées" className="bg-noir">
        <div className="conteneur flex flex-col gap-1 py-2 text-[16px] tab:flex-row tab:justify-end tab:gap-6 tab:py-[5px]">
          <a href={site.mapsHeader} target="_blank" rel="noopener" className="flex items-center gap-2 hover:text-beige">
            <IconeLieu className="h-4 w-4 shrink-0" />
            {site.adresse}
          </a>
          <a href={site.telephoneHref} className="flex items-center gap-2 hover:text-beige">
            <IconeTel className="h-4 w-4 shrink-0" />
            {site.telephone}
          </a>
        </div>
      </aside>
      {/* Barre de navigation collante (68 px desktop) */}
      <header className="sticky top-0 z-40 bg-noir">
        <div className="conteneur flex h-[55px] items-center justify-between desk:h-[68px]">
          <Logo />
          <nav aria-label="Navigation principale" className="hidden desk:block">
            <ul className="flex gap-6">
              {site.nav.map((l) => (
                <li key={l.href}>
                  <NavLien href={l.href}>{l.label}</NavLien>
                </li>
              ))}
            </ul>
          </nav>
          <MenuMobile />
        </div>
      </header>
    </>
  );
}

