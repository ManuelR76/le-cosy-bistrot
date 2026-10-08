"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { mediaUrl } from "@/lib/media";

type Actu = { id: string; slug: string; titre: string; texte: string; date: string; image: { src: string; alt: string } | null };
type Brouillon = { id?: string; titre: string; texte: string; date: string; image: Actu["image"] };

export const EVT_NOUVELLE_ACTU = "cosy:nouvelle-actu";
const aujourdhui = () => new Date().toISOString().slice(0, 10);
const vide = (): Brouillon => ({ titre: "", texte: "", date: aujourdhui(), image: null });

/** Onglet « Actualités » du panneau : liste + bouton d'ajout. */
export function OngletActualites({ assistant, ouvrirDirect = false, onFormFerme }: { assistant: boolean; ouvrirDirect?: boolean; onFormFerme?: () => void }) {
  const [actus, setActus] = useState<Actu[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [form, setForm] = useState<Brouillon | null>(() => (ouvrirDirect ? vide() : null));
  const [aSupprimer, setASupprimer] = useState<string | null>(null);

  const charger = useCallback(async () => {
    const r = await fetch("/api/edition/actualites/");
    const j = await r.json();
    if (!r.ok) return setErreur(j.erreur);
    setActus(j.actualites);
  }, []);

  useEffect(() => {
    let vivant = true;
    fetch("/api/edition/actualites/")
      .then(async (r) => {
        const j = await r.json();
        if (!vivant) return;
        if (!r.ok) setErreur(j.erreur);
        else setActus(j.actualites);
      })
      .catch(() => vivant && setErreur("Liste indisponible."));
    return () => {
      vivant = false;
    };
  }, []);

  const supprimer = async (id: string) => {
    const r = await fetch("/api/edition/actualites/", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (!r.ok) return setErreur((await r.json()).erreur);
    setASupprimer(null);
    charger();
  };

  return (
    <div className="flex flex-col">
      <div className="p-4">
        <button type="button" className="btn w-full text-[20px]" onClick={() => setForm(vide())}>
          + Ajouter une actualité
        </button>
      </div>
      {erreur && <p className="px-4 pb-3 text-beige">{erreur}</p>}
      {!actus ? (
        <p className="px-4 text-gris">Chargement…</p>
      ) : !actus.length ? (
        <p className="px-4 pb-4 text-gris">Vos actualités apparaîtront ici. Les 12 articles d&apos;origine du site restent en place.</p>
      ) : (
        <ul className="divide-y divide-beige/20 border-t border-beige/20">
          {actus.map((a) => (
            <li key={a.id} className="flex gap-3 px-4 py-3">
              {a.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(a.image.src)} alt="" className="h-14 w-20 shrink-0 object-cover" />
              ) : (
                <span className="h-14 w-20 shrink-0 bg-[#1f1f1f]" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{a.titre}</p>
                <p className="text-xs text-gris">{new Date(a.date).toLocaleDateString("fr-FR", { dateStyle: "long" })}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 text-sm">
                  <a href={`/${a.slug}/`} className="underline">
                    Voir
                  </a>
                  <button type="button" className="underline" onClick={() => setForm({ ...a, date: a.date.slice(0, 10) })}>
                    Modifier
                  </button>
                  {aSupprimer === a.id ? (
                    <span className="flex gap-2">
                      <button type="button" className="text-beige underline" onClick={() => supprimer(a.id)}>
                        Confirmer la suppression
                      </button>
                      <button type="button" className="underline" onClick={() => setASupprimer(null)}>
                        Non
                      </button>
                    </span>
                  ) : (
                    <button type="button" className="text-beige underline" onClick={() => setASupprimer(a.id)}>
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {form && (
        <FormulaireActu
          initial={form}
          assistant={assistant}
          onFermer={() => {
            setForm(null);
            onFormFerme?.();
          }}
          onPublie={() => {
            setForm(null);
            charger();
            onFormFerme?.();
          }}
        />
      )}
    </div>
  );
}

/** Fenêtre de rédaction : titre, photo, texte, date — avec aide à la rédaction. */
function FormulaireActu({ initial, assistant, onFermer, onPublie }: { initial: Brouillon; assistant: boolean; onFermer: () => void; onPublie: () => void }) {
  const [b, setB] = useState<Brouillon>(initial);
  const [notes, setNotes] = useState("");
  const [etat, setEtat] = useState<{ type: "info" | "erreur" | "ok"; texte: string; url?: string } | null>(null);
  const [occupe, setOccupe] = useState<"photo" | "redaction" | "publication" | null>(null);
  const maj = (p: Partial<Brouillon>) => setB((x) => ({ ...x, ...p }));

  useEffect(() => {
    const echap = (e: KeyboardEvent) => e.key === "Escape" && !occupe && onFermer();
    window.addEventListener("keydown", echap);
    return () => window.removeEventListener("keydown", echap);
  }, [occupe, onFermer]);

  const envoyerPhoto = async (f: File) => {
    setOccupe("photo");
    setEtat(null);
    const fd = new FormData();
    fd.append("photo", f);
    const r = await fetch("/api/edition/photo/", { method: "POST", body: fd });
    const j = await r.json();
    setOccupe(null);
    if (!r.ok) return setEtat({ type: "erreur", texte: j.erreur });
    maj({ image: { src: j.url, alt: b.titre || "Le Cosy Bistrot" } });
  };

  const rediger = async () => {
    setOccupe("redaction");
    setEtat(null);
    const r = await fetch("/api/edition/actualites/rediger/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes, titre: b.titre }),
    });
    const j = await r.json();
    setOccupe(null);
    if (!r.ok) return setEtat({ type: "erreur", texte: j.erreur });
    maj({ titre: j.titre, texte: j.texte });
    setEtat({ type: "info", texte: "Proposition prête : relisez et corrigez si besoin avant de publier." });
  };

  const publier = async () => {
    setOccupe("publication");
    setEtat(null);
    const r = await fetch("/api/edition/actualites/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...b, image: b.image ? { ...b.image, alt: b.image.alt || b.titre } : null }),
    });
    const j = await r.json();
    setOccupe(null);
    if (!r.ok) return setEtat({ type: "erreur", texte: j.erreur });
    setEtat({ type: "ok", texte: b.id ? "Actualité mise à jour." : "Actualité publiée !", url: j.url });
    maj({ id: j.actualite.id });
  };

  const nbParagraphes = b.texte.split(/\n\s*\n/).filter((p) => p.trim()).length;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="actu-titre-fenetre" className="ui-edition fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-2 tab:p-6">
      <div className="flex max-h-[96vh] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl bg-[#161618] text-[15px] ring-1 ring-white/10">
        <header className="flex items-center justify-between border-b border-beige/30 px-5 py-4">
          <p id="actu-titre-fenetre" className="text-[20px] font-semibold">
            {initial.id ? "Modifier l'actualité" : "Nouvelle actualité"}
          </p>
          <button type="button" onClick={onFermer} disabled={!!occupe} className="text-gris underline hover:text-blanc">
            Fermer
          </button>
        </header>

        <div className="flex flex-col gap-5 overflow-y-auto px-5 py-5">
          {assistant && !initial.id && (
            <section className="border border-beige/40 bg-[#1b1b1b] p-4">
              <p className="font-bold">Besoin d&apos;aide pour écrire ?</p>
              <p className="mb-2 text-gris">Notez l&apos;essentiel en quelques mots, l&apos;assistant rédige le titre et le texte.</p>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex. : soirée jazz samedi 14 novembre, groupe Les Copains d'abord, menu spécial 32 €, réservation par téléphone"
                className="w-full resize-none border border-gris/40 bg-noir px-3 py-2"
              />
              <button type="button" onClick={rediger} disabled={!!occupe || notes.trim().length < 5} className="btn mt-2 text-[18px] disabled:opacity-40">
                {occupe === "redaction" ? "Rédaction…" : "Rédiger pour moi"}
              </button>
            </section>
          )}

          <label className="flex flex-col gap-1">
            <span className="font-bold">1. Titre</span>
            <input value={b.titre} onChange={(e) => maj({ titre: e.target.value })} maxLength={140} placeholder="Ex. : Soirée jazz le 14 novembre" className="border border-gris/40 bg-[#1b1b1b] px-3 py-2 text-[17px]" />
          </label>

          <div className="flex flex-col gap-2">
            <span className="font-bold">2. Photo</span>
            <div className="flex flex-wrap items-center gap-4">
              {b.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(b.image.src)} alt="" className="h-28 w-40 object-cover" />
              ) : (
                <span className="flex h-28 w-40 items-center justify-center bg-[#1b1b1b] text-center text-xs text-gris">Aucune photo</span>
              )}
              <div className="flex flex-col gap-2">
                <label className="btn cursor-pointer text-center text-[18px]">
                  {occupe === "photo" ? "Envoi…" : b.image ? "Changer la photo" : "Choisir une photo"}
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => e.target.files?.[0] && envoyerPhoto(e.target.files[0])} />
                </label>
                {b.image && (
                  <button type="button" className="text-sm text-gris underline" onClick={() => maj({ image: null })}>
                    Retirer la photo
                  </button>
                )}
              </div>
            </div>
          </div>

          <label className="flex flex-col gap-1">
            <span className="font-bold">3. Texte</span>
            <span className="text-xs text-gris">Laissez une ligne vide entre deux paragraphes.</span>
            <textarea value={b.texte} onChange={(e) => maj({ texte: e.target.value })} rows={9} className="resize-y border border-gris/40 bg-[#1b1b1b] px-3 py-2 leading-6" />
            <span className="text-xs text-gris">
              {nbParagraphes} paragraphe{nbParagraphes > 1 ? "s" : ""}
            </span>
          </label>

          <label className="flex w-fit flex-col gap-1">
            <span className="font-bold">4. Date de l&apos;actualité</span>
            <input type="date" value={b.date.slice(0, 10)} onChange={(e) => maj({ date: e.target.value })} className="border border-gris/40 bg-[#1b1b1b] px-3 py-2 [color-scheme:dark]" />
          </label>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-beige/30 px-5 py-4">
          <p role="status" className={etat?.type === "erreur" ? "text-beige" : etat?.type === "ok" ? "text-blanc" : "text-gris"}>
            {etat?.texte}{" "}
            {etat?.url && (
              <a href={etat.url} className="underline">
                Voir l&apos;actualité
              </a>
            )}
          </p>
          <div className="flex gap-3">
            {etat?.type === "ok" && (
              <button type="button" className="btn btn-clair text-[18px]" onClick={onPublie}>
                Terminer
              </button>
            )}
            <button type="button" onClick={publier} disabled={!!occupe || b.titre.trim().length < 3 || b.texte.trim().length < 20} className="btn text-[18px] disabled:opacity-40">
              {occupe === "publication" ? "Publication…" : b.id ? "Enregistrer les changements" : "Publier"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

/** Bouton visible seulement en mode édition, posé dans la page (accueil, liste des articles). */
export function BoutonAjoutActualite() {
  const visible = useSyncExternalStore(
    () => () => {},
    () => document.cookie.split("; ").includes("cosy-edition=1"),
    () => false,
  );
  if (!visible) return null;
  return (
    <button type="button" className="ui-edition btn mb-8 text-[20px]" onClick={() => window.dispatchEvent(new CustomEvent(EVT_NOUVELLE_ACTU))}>
      + Ajouter une actualité
    </button>
  );
}
