/** Données lues par le panneau d'édition (onglet « Google ») ; invisible pour les visiteurs. */
export function SeoEdition({ chemin, title, description }: { chemin: string; title: string; description: string }) {
  return <div hidden data-seo={chemin} data-title={title} data-description={description} />;
}
