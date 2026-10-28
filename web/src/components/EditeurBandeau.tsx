"use client";

import { useEffect, useState } from "react";

type B = {
  actif: boolean;
  texte: string;
  lien: { label: string; href: string } | null;
  affichage: "haut" | "popup";
  style: "info" | "important";
  debut?: string;
  fin?: string;
  version: number;
};

const MODELES = [
  { nom: "Recrutement", texte: "Nous recrutons ! Rejoignez l'équipe du Cosy Bistrot.", lien: { label: "Nous contacter", href: "/contact/" } },
  { nom: "Fermeture exceptionnelle", texte: "Fermeture exceptionnelle le [date]. Merci de votre compréhension.", lien: null },
  { nom: "Horaires modifiés", texte: "Horaires modifiés cette semaine : [précisez].", lien: null },
];

const champ = "border border-gris/40 bg-[#1b1b1b] px-3 py-2 [color-scheme:dark]";

/** Onglet « Bandeau » : message en haut du site ou pop-up sur l'accueil. */
export function OngletBandeau() {
  const [b, setB] = useState<B | null>(null);
  const [etat, setEtat] = useState<{ ok: boolean; texte: string } | null>(null);
  const [occupe, setOccupe] = useState(false);

  useEffect(() => {
    let vivant = true;
    fetch("/api/edition/bandeau/")
      .then(async (r) => {
        const j = await r.json();
        if (!vivant) return;
        if (!r.ok) setEtat({ ok: false, texte: j.erreur });
        else setB(j.bandeau);
      })
      .catch(() => vivant && setEtat({ ok: false, texte: "Bandeau indisponible." }));
    return () => {
      vivant = false;
    };
  }, []);

  if (!b) return <p className="p-4 text-gris">{etat?.texte ?? "Chargement…"}</p>;
  const maj = (p: Partial<B>) => setB((x) => (x ? { ...x, ...p } : x));

  const enregistrer = async () => {
    setOccupe(true);
    setEtat(null);
    const r = await fetch("/api/edition/bandeau/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });
    const j = await r.json();
    setOccupe(false);
    if (!r.ok) return setEtat({ ok: false, texte: j.erreur });
    setB(j.bandeau);
    setEtat({ ok: true, texte: j.bandeau.actif ? "Bandeau enregistré. Il apparaît sur le site d'ici une minute." : "Bandeau désactivé (le texte est conservé)." });
  };

  const voirPopup = () => {
    try {
      sessionStorage.removeItem(`cosy-popup-${b.version}`);
    } catch {}
    window.location.href = "/?popup=1";
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <label className="flex items-center gap-2 font-bold">
        <input type="checkbox" checked={b.actif} onChange={(e) => maj({ actif: e.target.checked })} className="h-5 w-5" />
        Afficher le bandeau sur le site
      </label>

      <div className="flex flex-col gap-1">
        <span className="font-bold">Message</span>
        <div className="flex flex-wrap gap-1.5">
          {MODELES.map((m) => (
            <button key={m.nom} type="button" className="rounded-full border border-beige/40 px-2.5 py-1 text-xs hover:bg-white/10" onClick={() => maj({ texte: m.texte, lien: m.lien })}>
              {m.nom}
            </button>
          ))}
        </div>
        <textarea value={b.texte} onChange={(e) => maj({ texte: e.target.value })} rows={3} maxLength={240} className={`${champ} resize-y leading-6`} />
        <span className="text-xs text-gris">{b.texte.length} / 240</span>
      </div>

      <fieldset className="flex flex-col gap-1">
        <legend className="font-bold">Lien (facultatif)</legend>
        <input value={b.lien?.label ?? ""} onChange={(e) => maj({ lien: { label: e.target.value, href: b.lien?.href ?? "" } })} placeholder="Texte du lien : En savoir plus" className={champ} />
        <input value={b.lien?.href ?? ""} onChange={(e) => maj({ lien: { label: b.lien?.label ?? "", href: e.target.value } })} placeholder="Adresse : /privatisation/ ou tel:0227360549" className={champ} />
      </fieldset>

      <fieldset className="flex flex-col gap-1">
        <legend className="font-bold">Où l&apos;afficher ?</legend>
        <label className="flex items-center gap-2"><input type="radio" name="aff" checked={b.affichage === "haut"} onChange={() => maj({ affichage: "haut" })} /> Bandeau en haut du site (toutes les pages)</label>
        <label className="flex items-center gap-2"><input type="radio" name="aff" checked={b.affichage === "popup"} onChange={() => maj({ affichage: "popup" })} /> Pop-up à l&apos;ouverture de l&apos;accueil (une fois par visite)</label>
      </fieldset>

      <fieldset className="flex flex-col gap-1">
        <legend className="font-bold">Style</legend>
        <label className="flex items-center gap-2"><input type="radio" name="sty" checked={b.style === "info"} onChange={() => maj({ style: "info" })} /> Discret (beige)</label>
        <label className="flex items-center gap-2"><input type="radio" name="sty" checked={b.style === "important"} onChange={() => maj({ style: "important" })} /> Important (rouge)</label>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-bold">Période d&apos;affichage</legend>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2"><input type="checkbox" checked={!b.debut} onChange={(e) => maj({ debut: e.target.checked ? undefined : new Date().toISOString().slice(0, 10) })} /> Dès maintenant</label>
          {b.debut && <input type="date" value={b.debut} onChange={(e) => maj({ debut: e.target.value })} className={champ} aria-label="Date de début" />}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2"><input type="checkbox" checked={!b.fin} onChange={(e) => maj({ fin: e.target.checked ? undefined : b.debut || new Date().toISOString().slice(0, 10) })} /> Sans date de fin</label>
          {b.fin && <input type="date" value={b.fin} min={b.debut} onChange={(e) => maj({ fin: e.target.value })} className={champ} aria-label="Date de fin" />}
        </div>
        <span className="text-xs text-gris">La date de fin est incluse : le bandeau disparaît le lendemain.</span>
      </fieldset>

      {etat && <p role="status" className={etat.ok ? "text-blanc" : "text-beige"}>{etat.texte}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn text-[18px] disabled:opacity-40" onClick={enregistrer} disabled={occupe}>
          {occupe ? "Enregistrement…" : "Enregistrer le bandeau"}
        </button>
        {b.affichage === "popup" && (
          <button type="button" className="btn btn-clair text-[18px]" onClick={voirPopup}>Voir le pop-up</button>
        )}
      </div>
    </div>
  );
}
