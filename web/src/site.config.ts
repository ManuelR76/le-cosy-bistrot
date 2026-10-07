// Configuration structurelle du site. Valeurs reprises du site d'origine (07/10/2026).
// Repli statique : écrasé par les options ACF « Infos » quand WordPress répond.

export const site = {
  name: "Le Cosy Bistrot",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://lecosybistrot27.fr").replace(/\/$/, ""),
  locale: "fr_FR",
  adresse: "203 Rue des Peupliers, 27310 Bourg-Achard",
  adresseDetail: { rue: "203 Rue des Peupliers", codePostal: "27310", ville: "Bourg-Achard", pays: "FR" },
  // Deux liens Maps différents sur le site d'origine (en-tête / pied) : conservés tels quels.
  mapsHeader: "https://maps.app.goo.gl/DW9MzTUWThqsKSh78",
  mapsFooter: "https://maps.app.goo.gl/PzXDZdnHBtpU3fa1A",
  mapsEmbedQuery: "Le cosy bistrot bourg achard",
  telephone: "02 27 36 05 49",
  telephoneHref: "tel:+33227360549",
  nav: [
    { label: "Le Cosy Bistrot", href: "/le-cosy-bistrot/" },
    { label: "Privatisation", href: "/privatisation/" },
    { label: "Evenement", href: "/evenement/" },
    { label: "Retrouvez-Nous", href: "/retrouvez-nous/" },
  ],
  planDuSite: [
    { label: "Accueil", href: "/" },
    { label: "Le Cosy Bistrot", href: "/le-cosy-bistrot/" },
    { label: "Privatisation", href: "/privatisation/" },
    { label: "Évènement", href: "/evenement/" },
    { label: "Retrouvez-nous", href: "/retrouvez-nous/" },
  ],
  legal: [
    { label: "Mentions légales", href: "/mentions-legales/" },
    { label: "RGPD", href: "/politique-de-confidentialite/" },
    { label: "Sitemap", href: "/sitemap.xml" },
    { label: "Articles", href: "/articles/" },
  ],
  credit: { label: "HTAG Agence Web Le Havre", href: "https://htag-telecom.fr" },
  horaires: [
    { jour: "Lundi", texte: "de 07h00 à 15h00" },
    { jour: "Mardi", texte: "de 07h00 à 15h00" },
    { jour: "Mercredi", texte: "de 07h00 à 15h00" },
    { jour: "Jeudi", texte: "de 07h00 à 15h00" },
    { jour: "Vendredi", texte: "de 07h00 à 15h00" },
    { jour: "Samedi", texte: "de 07h00 à 15h00" },
    { jour: "Samedi soir", texte: "Selon évènement" },
    { jour: "Dimanche", texte: "Selon évènement" },
  ],
  formules: [
    { titre: "Formule cosy semaine", detail: "Entree + plat + dessert", prix: "21,90€" },
    { titre: "Formule cosy samedi", detail: "Entree + plat + dessert", prix: "23,90€" },
    { titre: "Formule express", detail: "entrée + plat ou plat + dessert", prix: "18,90€" },
  ],
} as const;

export type Site = typeof site;
