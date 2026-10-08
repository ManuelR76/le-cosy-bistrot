#!/usr/bin/env node
// Rejoue toutes les URL de l'inventaire contre une base (préprod/local).
// Échoue sur 404/5xx, sur une chaîne de redirections (> 1 saut) ou une cible finale ≠ 200.
// Usage : node scripts/check-redirects.mjs http://localhost:3000 [urls.csv]
import fs from "node:fs";

const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const csv = process.argv[3] || new URL("../../contexte-projet/inventaire/urls.csv", import.meta.url).pathname;
const extra = ["/feed/", "/sitemap_index.xml", "/wp-sitemap.xml", "/post-sitemap.xml", "/page-sitemap.xml", "/sitemap.rss", "/category/bristot/", "/le-cosy-bistrot", "/?p=803", "/?p=757", "/?page_id=19", "/?page_id=7", "/?p=10"];
const paths = [...fs.readFileSync(csv, "utf8").trim().split("\n").slice(1).map((l) => l.split(",")[0]), ...extra];

let ko = 0;
for (const p of paths) {
  const r1 = await fetch(base + p, { redirect: "manual" });
  let ligne = `${r1.status} ${p}`;
  let finalStatus = r1.status;
  if (r1.status >= 300 && r1.status < 400) {
    const loc = new URL(r1.headers.get("location"), base + p);
    const target = loc.origin === new URL(base).origin ? loc.href : null;
    if (target) {
      const r2 = await fetch(target, { redirect: "manual" });
      finalStatus = r2.status;
      ligne += ` → ${loc.pathname} (${r2.status})`;
      if (r2.status !== 200) ligne += "  ✗ chaîne ou cible non 200";
    } else ligne += ` → ${loc.href} (externe)`;
  }
  const ok = finalStatus === 200 || (r1.status >= 300 && r1.status < 400 && finalStatus !== 404 && finalStatus < 500 && !ligne.includes("✗"));
  if (!ok) ko++;
  console.log((ok ? "✓ " : "✗ ") + ligne);
}
console.log(`\n${paths.length - ko}/${paths.length} OK`);
process.exit(ko ? 1 : 0);
