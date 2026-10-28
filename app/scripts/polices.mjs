// Prébuild : si les woff2 ne sont pas dans le dépôt (déploiement sans Git), les reconstruit
// depuis les TTF d'origine hébergés par le WordPress.
import fs from "node:fs";
import path from "node:path";
import wawoff2 from "wawoff2";

const dir = path.join(process.cwd(), "public/fonts");
const src = (process.env.NEXT_PUBLIC_WP_MEDIA_URL || "https://admin.lecosybistrot27.fr").replace(/\/$/, "");
fs.mkdirSync(dir, { recursive: true });
for (const nom of ["Gimoc-Botuned", "Congratulations_DEMO"]) {
  const cible = path.join(dir, `${nom}.woff2`);
  if (fs.existsSync(cible)) continue;
  try {
    const res = await fetch(`${src}/wp-content/uploads/2024/02/${nom}.ttf`);
    if (!res.ok) throw new Error(String(res.status));
    fs.writeFileSync(cible, await wawoff2.compress(new Uint8Array(await res.arrayBuffer())));
    console.log(`police ${nom}.woff2 générée`);
  } catch (e) {
    console.warn(`police ${nom} indisponible (${e.message}) : repli système`);
  }
}
