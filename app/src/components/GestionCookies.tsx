"use client";

import { resetConsent } from "./consent";

export function GestionCookies() {
  return (
    <button type="button" onClick={resetConsent} className="hover:text-beige">
      Cookies
    </button>
  );
}
