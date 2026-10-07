"use client";

import { useSyncExternalStore } from "react";

export type Consent = "granted" | "denied" | null;
const KEY = "cosy-consentement";
const EVENT = "cosy-consentement";

function read(): Consent {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(v: Exclude<Consent, null>) {
  try {
    window.localStorage.setItem(KEY, v);
  } catch {
    /* stockage indisponible : le choix vaut pour la page en cours */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: v }));
}

export function resetConsent() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new CustomEvent(EVENT));
}

let memo: Consent = null;
function subscribe(cb: () => void) {
  const h = (e: Event) => {
    memo = (e as CustomEvent).detail ?? read();
    cb();
  };
  window.addEventListener(EVENT, h);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, h);
    window.removeEventListener("storage", cb);
  };
}

/** undefined pendant le rendu serveur, puis le choix enregistré (null = pas encore choisi). */
export function useConsent(): Consent | undefined {
  return useSyncExternalStore(
    subscribe,
    () => read() ?? memo,
    () => undefined,
  );
}
