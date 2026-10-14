/** Attributs qui rendent un élément modifiable en mode édition (texte brut). */
export const ed = (chemin: string) => ({ "data-edit": chemin });

/** Attributs d'un groupe de photos modifiable (diaporama, image, galerie). */
export const edPhotos = (chemin: string, images: { src: string }[], unique = false) => ({
  "data-edit-photos": chemin,
  "data-photos": JSON.stringify(images.map((i) => i.src)),
  ...(unique ? { "data-photo-unique": "1" } : {}),
});
