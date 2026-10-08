import { texteModifiable } from "./autorise";

/** Attributs qui rendent un élément modifiable en mode édition (texte brut), si le client y a droit (autorise.ts). */
export const ed = (chemin: string) => (texteModifiable(chemin) ? { "data-edit": chemin } : {});

/** Attributs d'un groupe de photos modifiable (diaporama, image, galerie). */
export const edPhotos = (chemin: string, images: { src: string }[], unique = false) => ({
  "data-edit-photos": chemin,
  "data-photos": JSON.stringify(images.map((i) => i.src)),
  ...(unique ? { "data-photo-unique": "1" } : {}),
});
