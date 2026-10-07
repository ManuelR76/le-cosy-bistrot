"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { mediaUrl } from "@/lib/media";

/*
 * Mode édition « sur la page » + panneau d'aide en bas à droite.
 * Ne s'active que pour une personne connectée (cookie d'indication ; les droits réels
 * sont vérifiés côté serveur à chaque appel).
 */

type Groupe = { chemin: string; srcs: string[]; el: HTMLElement; unique: boolean };
type Mod = { avant: string; apres: string; libelle: string };
type Bulle = { role: "user" | "assistant"; content: string; nb?: number };
type Version = { id: string; date: string };
type Onglet = "assistant" | "modifs" | "google" | "historique" | "aide";

const lireCookie = (nom: string) => document.cookie.split("; ").some((c) => c === `${nom}=1`);
const champs = (chemin: string) => Array.from(document.querySelectorAll<HTMLElement>(`[data-edit="${CSS.escape(chemin)}"]`));
const court = (t: string, n = 60) => (t.length > n ? t.slice(0, n - 1) + "…" : t);

function libelleDe(el: HTMLElement): string {
  const tag = el.closest("h1,h2,h3,a,li,button")?.tagName ?? el.tagName;
  const role: Record<string, string> = { H1: "Titre principal", H2: "Titre", H3: "Sous-titre", A: "Bouton / lien", LI: "Ligne de liste" };
  return role[tag] ?? "Texte";
}

export function Editeur() {
  const actif = useSyncExternalStore(
    () => () => {},
    () => lireCookie("cosy-edition"),
    () => false,
  );
  const [mods, setMods] = useState<Record<string, Mod>>({});
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [panneauPhotos, setPanneauPhotos] = useState<Groupe | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [ouvert, setOuvert] = useState(true);
  const [onglet, setOnglet] = useState<Onglet>("assistant");
  const [seo, setSeo] = useState<{ chemin: string; title: string; description: string } | null>(null);
  const modsRef = useRef(mods);
  useEffect(() => {
    modsRef.current = mods;
  }, [mods]);

  /** Enregistre (ou annule si on revient au texte d'origine) une modification. */
  const noter = useCallback((chemin: string, apres: string, avantParDefaut: string, libelle: string) => {
    setMods((m) => {
      const avant = m[chemin]?.avant ?? avantParDefaut;
      const n = { ...m };
      if (apres === avant) delete n[chemin];
      else n[chemin] = { avant, apres, libelle };
      return n;
    });
  }, []);

  useEffect(() => {
    if (!actif) return;
    document.documentElement.classList.add("mode-edition");
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-edit]"));
    const origine = new Map(els.map((el) => [el, el.innerText]));

    const onInput = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      const chemin = el.dataset.edit!;
      const texte = el.innerText;
      // Même champ affiché à plusieurs endroits (adresse en-tête / pied) : on synchronise.
      for (const autre of champs(chemin)) if (autre !== el) autre.innerText = texte;
      noter(chemin, texte, origine.get(el) ?? "", libelleDe(el));
    };
    const bloquerLien = (e: Event) => e.preventDefault();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") e.preventDefault(); // pas de retour à la ligne dans les textes
    };
    for (const el of els) {
      el.contentEditable = "plaintext-only";
      el.spellcheck = true;
      el.addEventListener("input", onInput);
      el.addEventListener("keydown", onKey);
      el.closest("a")?.addEventListener("click", bloquerLien);
    }
    const seoEl = document.querySelector<HTMLElement>("[data-seo]");
    const raf = requestAnimationFrame(() => {
      setGroupes(
        Array.from(document.querySelectorAll<HTMLElement>("[data-edit-photos]")).map((el) => ({
          chemin: el.dataset.editPhotos!,
          srcs: JSON.parse(el.dataset.photos || "[]") as string[],
          el,
          unique: el.dataset.photoUnique === "1",
        })),
      );
      if (seoEl) setSeo({ chemin: seoEl.dataset.seo!, title: seoEl.dataset.title ?? "", description: seoEl.dataset.description ?? "" });
    });
    const quitter = (e: BeforeUnloadEvent) => {
      if (Object.keys(modsRef.current).length) e.preventDefault();
    };
    window.addEventListener("beforeunload", quitter);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("beforeunload", quitter);
      for (const el of els) {
        el.removeEventListener("input", onInput);
        el.removeEventListener("keydown", onKey);
        el.closest("a")?.removeEventListener("click", bloquerLien);
      }
    };
  }, [actif, noter]);

  const enregistrer = useCallback(async () => {
    setEnvoi(true);
    setMessage(null);
    try {
      const modifications = Object.fromEntries(Object.entries(modsRef.current).map(([k, v]) => [k, v.apres]));
      const res = await fetch("/api/edition/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modifications }),
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

  const annuler = useCallback((chemin: string) => {
    const m = modsRef.current[chemin];
    if (!m) return;
    for (const el of champs(chemin)) el.innerText = m.avant;
    setMods((x) => {
      const n = { ...x };
      delete n[chemin];
      return n;
    });
  }, []);

  /** Applique sur la page les propositions de l'assistant (aperçu, rien n'est publié). */
  const appliquer = useCallback(
    (props: { chemin: string; valeur: string }[]) => {
      let premier: HTMLElement | null = null;
      for (const { chemin, valeur } of props) {
        const els = champs(chemin);
        if (!els.length) continue;
        const avant = els[0].innerText;
        for (const el of els) {
          el.innerText = valeur;
          el.classList.add("edition-propose");
          window.setTimeout(() => el.classList.remove("edition-propose"), 4000);
        }
        premier ??= els[0];
        noter(chemin, valeur, avant, libelleDe(els[0]));
      }
      premier?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    [noter],
  );

  const changerPhoto = useCallback(async (g: Groupe, index: number, fichier: File) => {
    setMessage("Envoi de la photo…");
    const fd = new FormData();
    fd.append("photo", fichier);
    const res = await fetch("/api/edition/photo/", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok) return setMessage(json.erreur || "Échec de l'envoi.");
    const chemin = g.unique ? `${g.chemin}.src` : `${g.chemin}.${index}.src`;
    const avant = g.srcs[index];
    g.srcs[index] = json.url;
    setMods((m) => ({ ...m, [chemin]: { avant: m[chemin]?.avant ?? avant, apres: json.url, libelle: "Photo" } }));
    setPanneauPhotos({ ...g });
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
        .mode-edition .edition-propose{outline:3px solid #e11439!important;background:rgba(225,20,57,.25);transition:background .6s}
      `}</style>

      {groupes.map((g) => (
        <BoutonPhotos key={g.chemin} groupe={g} onOuvrir={() => setPanneauPhotos(g)} />
      ))}
      {panneauPhotos && <PanneauPhotos groupe={panneauPhotos} onFermer={() => setPanneauPhotos(null)} onChanger={changerPhoto} />}

      {!ouvert ? (
        <button
          type="button"
          onClick={() => setOuvert(true)}
          className="btn fixed right-4 bottom-4 z-[60] shadow-2xl"
          aria-label="Ouvrir le panneau d'édition"
        >
          Édition{n ? ` (${n})` : ""}
        </button>
      ) : (
        <aside
          aria-label="Panneau d'édition"
          className="fixed inset-x-2 bottom-2 z-[60] flex max-h-[75vh] flex-col border-2 border-beige bg-noir text-[15px] shadow-[0_10px_40px_rgba(0,0,0,.6)] tab:inset-x-auto tab:right-4 tab:bottom-4 tab:w-[400px]"
        >
          <header className="flex items-center justify-between gap-2 border-b border-beige/30 px-4 py-3">
            <div>
              <p className="font-accent text-[24px] leading-none">Mode édition</p>
              <p className="mt-1 text-xs text-gris">
                {n ? `${n} modification${n > 1 ? "s" : ""} non enregistrée${n > 1 ? "s" : ""}` : "Aucune modification en attente"}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={enregistrer} disabled={!n || envoi} className="btn px-3 py-2 text-[16px] disabled:opacity-40">
                {envoi ? "…" : "Enregistrer"}
              </button>
              <button type="button" onClick={() => setOuvert(false)} aria-label="Réduire le panneau" className="px-2 text-xl text-gris hover:text-blanc">
                –
              </button>
            </div>
          </header>
          {message && <p className="border-b border-beige/30 bg-[#1b1b1b] px-4 py-2 text-beige">{message}</p>}
          <nav className="flex border-b border-beige/30 text-sm" aria-label="Onglets du panneau">
            {(
              [
                ["assistant", "Assistant"],
                ["modifs", `Modifs${n ? ` (${n})` : ""}`],
                ["google", "Google"],
                ["historique", "Historique"],
                ["aide", "Aide"],
              ] as [Onglet, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setOnglet(id)}
                aria-pressed={onglet === id}
                className={`flex-1 px-1 py-2 ${onglet === id ? "bg-rouge text-blanc" : "text-gris hover:text-blanc"}`}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="min-h-[220px] overflow-y-auto">
            {onglet === "assistant" && <Assistant onAppliquer={appliquer} />}
            {onglet === "modifs" && <Modifs mods={mods} onAnnuler={annuler} />}
            {onglet === "google" && <Google seo={seo} mods={mods} onChanger={noter} />}
            {onglet === "historique" && <Historique />}
            {onglet === "aide" && <Aide />}
          </div>
          <footer className="flex justify-end border-t border-beige/30 px-4 py-2">
            <form action="/connexion/sortie/" method="post">
              <button type="submit" className="text-sm text-gris underline hover:text-blanc">
                Quitter le mode édition
              </button>
            </form>
          </footer>
        </aside>
      )}
    </>
  );
}

/* ---------- Onglet Assistant ---------- */
function Assistant({ onAppliquer }: { onAppliquer: (p: { chemin: string; valeur: string }[]) => void }) {
  const [fil, setFil] = useState<Bulle[]>([
    {
      role: "assistant",
      content:
        "Bonjour ! Dites-moi ce que vous voulez changer sur cette page, par exemple : « passe la formule du samedi à 24,90 € » ou « ajoute que nous sommes fermés le 24 décembre au texte des horaires ».",
    },
  ]);
  const [saisie, setSaisie] = useState("");
  const [attente, setAttente] = useState(false);
  const bas = useRef<HTMLDivElement>(null);
  useEffect(() => bas.current?.scrollIntoView({ block: "end" }), [fil]);

  const envoyer = async () => {
    const texte = saisie.trim();
    if (!texte || attente) return;
    const historique = [...fil.slice(1), { role: "user" as const, content: texte }];
    setFil((f) => [...f, { role: "user", content: texte }]);
    setSaisie("");
    setAttente(true);
    const vus = new Set<string>();
    const lesChamps = Array.from(document.querySelectorAll<HTMLElement>("[data-edit]"))
      .filter((el) => (vus.has(el.dataset.edit!) ? false : (vus.add(el.dataset.edit!), true)))
      .map((el) => ({ chemin: el.dataset.edit!, texte: el.innerText, role: libelleDe(el) }));
    try {
      const res = await fetch("/api/edition/assistant/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historique: historique.map(({ role, content }) => ({ role, content })), champs: lesChamps, page: document.title }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erreur);
      if (json.modifications?.length) onAppliquer(json.modifications);
      setFil((f) => [...f, { role: "assistant", content: json.message, nb: json.modifications?.length ?? 0 }]);
    } catch (e) {
      setFil((f) => [...f, { role: "assistant", content: (e as Error).message || "Une erreur est survenue." }]);
    } finally {
      setAttente(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-3 p-4" aria-live="polite">
        {fil.map((b, i) => (
          <div key={i} className={`max-w-[90%] px-3 py-2 ${b.role === "user" ? "self-end bg-rouge" : "self-start bg-[#1f1f1f]"}`}>
            <p className="whitespace-pre-line">{b.content}</p>
            {!!b.nb && (
              <p className="mt-1 text-xs text-beige">
                {b.nb} changement{b.nb > 1 ? "s" : ""} surligné{b.nb > 1 ? "s" : ""} sur la page — vérifiez, puis « Enregistrer ».
              </p>
            )}
          </div>
        ))}
        {attente && <p className="self-start text-gris">L&apos;assistant prépare les changements…</p>}
        <div ref={bas} />
      </div>
      <form
        className="sticky bottom-0 flex gap-2 border-t border-beige/30 bg-noir p-3"
        onSubmit={(e) => {
          e.preventDefault();
          envoyer();
        }}
      >
        <label htmlFor="assistant-saisie" className="sr-only">
          Votre demande
        </label>
        <textarea
          id="assistant-saisie"
          rows={2}
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              envoyer();
            }
          }}
          placeholder="Ex. : change le prix de la formule express à 19,50 €"
          className="flex-1 resize-none border border-gris/40 bg-[#1b1b1b] px-3 py-2 text-blanc placeholder:text-gris/60"
        />
        <button type="submit" disabled={attente || !saisie.trim()} className="btn self-end px-3 py-2 text-[16px] disabled:opacity-40">
          Envoyer
        </button>
      </form>
    </div>
  );
}

/* ---------- Onglet Modifications ---------- */
function Modifs({ mods, onAnnuler }: { mods: Record<string, Mod>; onAnnuler: (c: string) => void }) {
  const liste = Object.entries(mods);
  if (!liste.length) return <p className="p-4 text-gris">Aucune modification en attente. Cliquez sur un texte de la page pour le modifier.</p>;
  return (
    <ul className="divide-y divide-beige/20">
      {liste.map(([chemin, m]) => (
        <li key={chemin} className="flex flex-col gap-1 px-4 py-3">
          <p className="text-xs tracking-wide text-beige uppercase">{m.libelle}</p>
          {m.libelle === "Photo" || m.libelle.startsWith("Google") ? (
            <p>{m.libelle === "Photo" ? "Nouvelle photo" : court(m.apres, 120)}</p>
          ) : (
            <>
              <p className="text-gris line-through">{court(m.avant)}</p>
              <p>{court(m.apres)}</p>
            </>
          )}
          <div className="mt-1 flex gap-4 text-sm">
            {m.libelle !== "Photo" && !m.libelle.startsWith("Google") && (
              <button type="button" className="underline" onClick={() => champs(chemin)[0]?.scrollIntoView({ behavior: "smooth", block: "center" })}>
                Voir
              </button>
            )}
            <button type="button" className="text-beige underline" onClick={() => onAnnuler(chemin)}>
              Annuler
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Onglet Google (titre et description de la page) ---------- */
function Google({
  seo,
  mods,
  onChanger,
}: {
  seo: { chemin: string; title: string; description: string } | null;
  mods: Record<string, Mod>;
  onChanger: (chemin: string, apres: string, avant: string, libelle: string) => void;
}) {
  if (!seo) return <p className="p-4 text-gris">Cette page n&apos;a pas de réglages Google modifiables.</p>;
  const t = mods[`${seo.chemin}.title`]?.apres ?? seo.title;
  const d = mods[`${seo.chemin}.description`]?.apres ?? seo.description;
  return (
    <div className="flex flex-col gap-4 p-4">
      <p className="text-gris">Ce que Google affiche dans ses résultats pour cette page.</p>
      <label className="flex flex-col gap-1">
        <span className="flex justify-between">
          Titre <span className={t.length > 60 ? "text-beige" : "text-gris"}>{t.length}/60</span>
        </span>
        <input
          value={t}
          onChange={(e) => onChanger(`${seo.chemin}.title`, e.target.value, seo.title, "Google — titre")}
          className="border border-gris/40 bg-[#1b1b1b] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="flex justify-between">
          Description <span className={d.length > 155 ? "text-beige" : "text-gris"}>{d.length}/155</span>
        </span>
        <textarea
          rows={5}
          value={d}
          onChange={(e) => onChanger(`${seo.chemin}.description`, e.target.value, seo.description, "Google — description")}
          className="resize-none border border-gris/40 bg-[#1b1b1b] px-3 py-2"
        />
      </label>
      <div className="bg-white p-3 font-sans text-[#202124]">
        <p className="text-[18px] leading-tight text-[#1a0dab]">{court(t, 62)}</p>
        <p className="mt-1 text-[13px] text-[#4d5156]">{court(d, 158)}</p>
      </div>
    </div>
  );
}

/* ---------- Onglet Historique ---------- */
function Historique() {
  const [versions, setVersions] = useState<Version[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [aConfirmer, setAConfirmer] = useState<string | null>(null);

  useEffect(() => {
    let vivant = true;
    fetch("/api/edition/etat/")
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.erreur);
        if (vivant) setVersions(j.versions);
      })
      .catch((e) => vivant && setErreur((e as Error).message || "Historique indisponible."));
    return () => {
      vivant = false;
    };
  }, []);

  const restaurer = async (id: string) => {
    const r = await fetch("/api/edition/restaurer/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (r.ok) window.location.reload();
    else setErreur((await r.json()).erreur || "Échec de la restauration.");
  };

  if (erreur) return <p className="p-4 text-beige">{erreur}</p>;
  if (!versions) return <p className="p-4 text-gris">Chargement…</p>;
  if (!versions.length) return <p className="p-4 text-gris">Aucune version précédente pour l&apos;instant : elles apparaîtront après vos premiers enregistrements.</p>;
  return (
    <ul className="divide-y divide-beige/20">
      {versions.map((v) => (
        <li key={v.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <span>
            Avant l&apos;enregistrement du{" "}
            {new Date(v.date).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Paris" })}
          </span>
          {aConfirmer === v.id ? (
            <span className="flex gap-2 text-sm">
              <button type="button" className="btn px-2 py-1 text-[15px]" onClick={() => restaurer(v.id)}>
                Confirmer
              </button>
              <button type="button" className="underline" onClick={() => setAConfirmer(null)}>
                Non
              </button>
            </span>
          ) : (
            <button type="button" className="text-sm text-beige underline" onClick={() => setAConfirmer(v.id)}>
              Revenir à cette version
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

/* ---------- Onglet Aide ---------- */
function Aide() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <p>
        <strong>Modifier un texte</strong> : cliquez dessus (contour en pointillés) et écrivez. Les liens et la mise en page ne
        bougent pas.
      </p>
      <p>
        <strong>Changer une photo</strong> : bouton « Changer les photos » en haut à gauche de chaque zone photo (JPG, PNG ou WebP,
        8 Mo maximum).
      </p>
      <p>
        <strong>Assistant</strong> : décrivez le changement avec vos mots ; il le prépare et le surligne sur la page. Rien n&apos;est
        publié tant que vous n&apos;avez pas cliqué sur « Enregistrer ».
      </p>
      <p>
        <strong>Annuler</strong> : onglet « Modifs » avant d&apos;enregistrer, ou « Historique » pour revenir à une version publiée.
      </p>
      <p>
        <strong>Autres pages</strong> : naviguez avec le menu ; enregistrez avant de changer de page.
      </p>
    </div>
  );
}

/* ---------- Photos ---------- */
function PanneauPhotos({ groupe, onFermer, onChanger }: { groupe: Groupe; onFermer: () => void; onChanger: (g: Groupe, i: number, f: File) => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-label="Changer les photos" className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-[720px] overflow-auto bg-noir p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-accent text-[28px]">Changer les photos</p>
          <button type="button" onClick={onFermer} className="btn btn-clair text-[18px]">
            Fermer
          </button>
        </div>
        <ul className="grid grid-cols-2 gap-4 tab:grid-cols-3">
          {groupe.srcs.map((src, i) => (
            <li key={i} className="flex flex-col gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaUrl(src)} alt="" className="aspect-[4/3] w-full object-cover" />
              <label className="btn cursor-pointer text-center text-[16px]">
                Remplacer
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="sr-only"
                  onChange={(e) => e.target.files?.[0] && onChanger(groupe, i, e.target.files[0])}
                />
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function BoutonPhotos({ groupe, onOuvrir }: { groupe: Groupe; onOuvrir: () => void }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  useEffect(() => {
    const maj = () => {
      const r = groupe.el.getBoundingClientRect();
      setPos({ top: r.top + window.scrollY + 12, left: r.left + window.scrollX + 12 });
    };
    const raf = requestAnimationFrame(maj);
    window.addEventListener("resize", maj);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", maj);
    };
  }, [groupe.el]);
  if (!pos) return null;
  return (
    <button type="button" onClick={onOuvrir} style={{ position: "absolute", ...pos }} className="btn z-[55] text-[16px] shadow-lg">
      Changer {groupe.srcs.length > 1 ? `les ${groupe.srcs.length} photos` : "la photo"}
    </button>
  );
}
