/**
 * Ce que le client peut modifier (décision 30) : l'essentiel d'un restaurant, rien qui touche au référencement.
 * - Coordonnées : téléphone, adresse.
 * - Horaires (lignes jour / heures + texte d'introduction).
 * - Formules et prix.
 * - Photos (tous les diaporamas, galeries et images).
 * - Actualités (onglet dédié, stockage séparé).
 * Titres, textes de présentation, boutons, balises Google, articles d'origine et pages légales : réservés à l'agence.
 */
const TEXTES = [
  /^site\.(telephone|adresse)$/,
  /^site\.horaires\.\d+\.(jour|texte)$/,
  /^site\.formules\.\d+\.(titre|detail|prix)$/,
  /^accueil\.horaires\.texte$/,
];

/** Chemins de photos : `<groupe>.<n>.src` ou `<image>.src`. */
const PHOTO = /^(accueil|privatisation|evenement|leCosyBistrot|retrouvezNous)(\.[A-Za-z0-9]+){0,5}\.src$/;

export const texteModifiable = (chemin: string) => TEXTES.some((r) => r.test(chemin));
export const cheminAutorise = (chemin: string) => texteModifiable(chemin) || PHOTO.test(chemin);
