"use client";

import { useEffect, useState } from "react";
import type { Image } from "@/content/pages";
import { Media } from "./Media";

type Props = {
  images: Image[];
  sizes: string;
  /** Durée par image (Elementor : 7 s). */
  duree?: number;
  priority?: boolean;
  voile?: boolean;
};

/** Diaporama de fond en fondu enchaîné. Fixe sur la 1re image si prefers-reduced-motion. */
export function Diaporama({ images, sizes, duree = 7000, priority, voile }: Props) {
  const [actif, setActif] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const id = window.setInterval(() => setActif((i) => (i + 1) % images.length), duree);
    return () => window.clearInterval(id);
  }, [images.length, duree]);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden={images.every((i) => !i.alt) || undefined}>
      {images.map((img, i) => (
        <div
          key={img.src}
          className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out motion-reduce:transition-none"
          style={{ opacity: i === actif ? 1 : 0 }}
        >
          <Media src={img.src} alt={img.alt} sizes={sizes} priority={priority && i === 0} />
        </div>
      ))}
      {voile && <div className="absolute inset-0 bg-noir/50" />}
    </div>
  );
}
