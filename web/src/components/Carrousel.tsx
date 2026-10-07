"use client";

import { useEffect, useRef, useState } from "react";
import type { Image } from "@/content/pages";
import { Media } from "./Media";

/**
 * Carrousel d'images (réglages Elementor d'origine) : 3 / 2 / 1 vues, espacement 64 / 32 / 16 px,
 * défilement auto 5 s, pause au survol, au focus et si prefers-reduced-motion.
 */
export function Carrousel({ images, label }: { images: Image[]; label: string }) {
  const piste = useRef<HTMLUListElement>(null);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    const el = piste.current;
    if (!el || pause) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      const item = el.querySelector("li");
      if (!item) return;
      const pas = item.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || "0");
      const fin = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
      el.scrollTo({ left: fin ? 0 : el.scrollLeft + pas, behavior: "smooth" });
    }, 5000);
    return () => window.clearInterval(id);
  }, [pause]);

  return (
    <section aria-label={label} className="conteneur py-[50px] desk:px-[143px] desk:py-[100px]">
      <ul
        ref={piste}
        onMouseEnter={() => setPause(true)}
        onMouseLeave={() => setPause(false)}
        onFocus={() => setPause(true)}
        onBlur={() => setPause(false)}
        onPointerDown={() => setPause(true)}
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto [scrollbar-width:none] tab:gap-8 desk:gap-16 [&::-webkit-scrollbar]:hidden"
      >
        {images.map((img) => (
          <li
            key={img.src}
            className="relative aspect-[2/3] w-full shrink-0 snap-start tab:w-[calc((100%-2rem)/2)] desk:w-[calc((100%-8rem)/3)]"
          >
            <Media src={img.src} alt={img.alt} sizes="(min-width: 1025px) 340px, (min-width: 768px) 50vw, 100vw" />
          </li>
        ))}
      </ul>
    </section>
  );
}
