/** Date du jour à Paris, au format AAAA-MM-JJ (comparable comme texte). */
export const aujourdhuiParis = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" });

export const JOUR = /^\d{4}-\d{2}-\d{2}$/;

/** Vrai si la date de fin est passée (la fin est inclusive : l'actualité reste en ligne jusqu'à minuit, heure de Paris). */
export const termine = (fin?: string | null) => Boolean(fin && JOUR.test(fin) && aujourdhuiParis() > fin);

/** Vrai si « aujourd'hui » est dans la période [debut, fin] (bornes facultatives, incluses). */
export const dansPeriode = (debut?: string | null, fin?: string | null) => {
  const j = aujourdhuiParis();
  return !(debut && JOUR.test(debut) && j < debut) && !(fin && JOUR.test(fin) && j > fin);
};
