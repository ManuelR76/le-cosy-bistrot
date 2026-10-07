// Prépare .next/standalone pour Hostinger (web app Node) : y copie public/ et .next/static/.
// Démarrage : node .next/standalone/server.js (PORT et HOSTNAME fournis par l'hébergeur).
import fs from "node:fs";
const cp = (de, vers) => fs.existsSync(de) && fs.cpSync(de, vers, { recursive: true });
cp("public", ".next/standalone/public");
cp(".next/static", ".next/standalone/.next/static");
console.log("standalone prêt : node .next/standalone/server.js");
