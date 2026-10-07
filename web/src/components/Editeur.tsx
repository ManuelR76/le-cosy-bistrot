"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { mediaUrl } from "@/lib/media";

type Groupe = { chemin: string; srcs: string[]; el: HTMLElement; unique: boolean };

function lireCookie(nom: string) {
  return document.cookie.split("; ").some((c) => c === `${nom}=1`);
}

/**
 * Mode édition « sur la page » : ne s'active que pour une personne connectée (cookie d'indication ;
 * les droits réels sont vérifiés côté serveur à chaque enregistrement).
 */
export function Editeur() {
  const actif = useSyncExternalStore(
    () => () => {},
    () => lireCookie("cosy-edition"),
    () => false,
  );
  const [mods, setMods] = useState<Record<string, string>>({});
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [panneau, setPanneau] = useState<Groupe | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const modsRef = useRef(mods);
  useEffect(() => {
    modsRef.current = mods;
  }, [mods]);

  useEffect(() => {
    if (!actif) return;
    document.documentElement.classList.add("mode-edition");

    const champs = Array.from(document.querySelectorAll<HTMLElement>("[data-edit]"));
    const avant = new Map(champs.map((el) => [el, el.innerText]));
    const onInput = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      const chemin = el.dataset.edit!;
      const texte = el.innerText;
      setMods((m) => {
        const n = { ...m };
        if (texte === avant.get(el)) delete n[chemin];
        else n[chemin] = texte;
        return n;
      });
    };
    const bloquerLien = (e: Event) => e.preventDefault();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !(e.currentTarget as HTMLElement).closest("p")) e.preventDefault();
    };
    for (const el of champs) {
      el.contentEditable = "plaintext-only";
      el.spellcheck = true;
      el.addEventListener("input", onInput);
      el.addEventListener("keydown", onKey);
      el.closest("a")?.addEventListener("click", bloquerLien);
    }
    const raf = requestAnimationFrame(() =>
      setGroupes(
      Array.from(document.querySelectorAll<HTMLElement>("[data-edit-photos]")).map((el) => ({
        chemin: el.dataset.editPhotos!,
        srcs: JSON.parse(el.dataset.photos || "[]") as string[],
        el,
        unique: el.dataset.photoUnique === "1",
      })),
      ),
    );
    const quitter = (e: BeforeUnloadEvent) => {
      if (Object.keys(modsRef.current).length) e.preventDefault();
    };
    window.addEventListener("beforeunload", quitter);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("beforeunload", quitter);
      for (const el of champs) {
        el.removeEventListener("input", onInput);
        el.removeEventListener("keydown", onKey);
        el.closest("a")?.removeEventListener("click", bloquerLien);
      }
    };
  }, [actif]);

  const enregistrer = useCallback(async () => {
    setEnvoi(true);
    setMessage(null);
    try {
      const res = await fetch("/api/edition/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modifications: modsRef.current }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erreur || "Échec de l'enregistrement.");
      setMods({});
      setMessage("Enregistré. Le site public sera à jour d'ici une minute.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setEnvoi(false);
    }
  }, []);

  const changerPhoto = useCallback(async (g: Groupe, index: number, fichier: File) => {
    setMessage("Envoi de la photo…");
    const fd = new FormData();
    fd.append("photo", fichier);
    const res = await fetch("/api/edition/photo/", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok) return setMessage(json.erreur || "Échec de l'envoi.");
    const chemin = g.unique ? `${g.chemin}.src` : `${g.chemin}.${index}.src`;
    g.srcs[index] = json.url;
    setMods((m) => ({ ...m, [chemin]: json.url }));
    setPanneau({ ...g });
    setMessage("Photo prête : pensez à enregistrer.");
  }, []);

  if (!actif) return null;
  const n = Object.keys(mods).length;

  return (
    <>
      <style>{`
        .mode-edition [data-edit]{outline:1px dashed rgba(227,199,181,.6);outline-offset:3px;cursor:text}
        .mode-edition [data-edit]:hover,.mode-edition [data-edit]:focus{outline:2px solid #e3c7b5}
        .mode-edition [data-edit-photos]{outline:2px dashed rgba(227,199,181,.5);outline-offset:-6px}
      `}</style>
      {groupes.map((g) => (
        <BoutonPhotos key={g.chemin} groupe={g} onOuvrir={() => setPanneau(g)} />
      ))}
      {panneau && (
        <div role="dialog" aria-modal="true" aria-label="Changer les photos" className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-[720px] overflow-auto bg-noir p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-accent text-[28px]">Changer les photos</p>
              <button type="button" onClick={() => setPanneau(null)} className="btn btn-clair text-[18px]">
                Fermer
              </button>
            </div>
            <ul className="grid grid-cols-2 gap-4 tab:grid-cols-3">
              {panneau.srcs.map((src, i) => (
                <li key={i} className="flex flex-col gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaUrl(src)} alt="" className="aspect-[4/3] w-full object-cover" />
                  <label className="btn cursor-pointer text-center text-[16px]">
                    Remplacer
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="sr-only"
                      onChange={(e) => e.target.files?.[0] && changerPhoto(panneau, i, e.target.files[0])}
                    />
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="fixed inset-x-0 bottom-0 z-[60] border-t-2 border-beige bg-noir/95 px-4 py-3">
        <div className="mx-auto flex max-w-[1297px] flex-wrap items-center justify-between gap-3">
          <p className="text-sm">
            <strong className="font-accent text-[20px]">Mode édition</strong> — cliquez sur un texte pour le modifier.{" "}
            {n > 0 ? `${n} modification${n > 1 ? "s" : ""} non enregistrée${n > 1 ? "s" : ""}.` : ""}
            {message && <span className="ml-2 text-beige">{message}</span>}
          </p>
          <div className="flex gap-3">
            <form action="/connexion/sortie/" method="post">
              <button type="submit" className="btn btn-clair text-[18px]">
                Quitter
              </button>
            </form>
            <button type="button" onClick={enregistrer} disabled={!n || envoi} className="btn text-[18px] disabled:opacity-50">
              {envoi ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/** Bouton posé sur chaque zone photo (positionné sur l'élément). */
function BoutonPhotos({ groupe, onOuvrir }: { groupe: Groupe; onOuvrir: () => void }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  useEffect(() => {
    const maj = () => {
      const r = groupe.el.getBoundingClientRect();
      setPos({ top: r.top + window.scrollY + 12, left: r.left + window.scrollX + 12 });
    };
    maj();
    window.addEventListener("resize", maj);
    return () => window.removeEventListener("resize", maj);
  }, [groupe.el]);
  if (!pos) return null;
  return (
    <button type="button" onClick={onOuvrir} style={{ position: "absolute", ...pos }} className="btn z-[55] text-[16px] shadow-lg">
      Changer {groupe.srcs.length > 1 ? `les ${groupe.srcs.length} photos` : "la photo"}
    </button>
  );
}
