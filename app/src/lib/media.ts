/**
 * Les médias restent dans la médiathèque WordPress (déplacée sur admin.).
 * Tout chemin /wp-content/uploads/... est résolu vers NEXT_PUBLIC_WP_MEDIA_URL,
 * quel que soit le domaine enregistré en base (normalisation après migration).
 */
const MEDIA_HOST = (process.env.NEXT_PUBLIC_WP_MEDIA_URL || "https://admin.lecosybistrot27.fr").replace(/\/$/, "");

export function mediaUrl(src: string): string {
  if (!src) return src;
  const i = src.indexOf("/wp-content/uploads/");
  return i >= 0 ? MEDIA_HOST + src.slice(i) : src;
}
