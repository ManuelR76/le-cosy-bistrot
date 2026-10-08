import Image from "next/image";
import { mediaUrl } from "@/lib/media";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/** next/image en mode `fill` : le parent fixe les dimensions (anti-CLS). */
export function Media({ src, alt, sizes, priority, className }: Props) {
  return (
    <Image
      src={mediaUrl(src)}
      alt={alt}
      fill
      sizes={sizes}
      preload={priority}
      loading={priority ? "eager" : undefined}
      className={`object-cover ${className ?? ""}`}
    />
  );
}
