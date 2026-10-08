import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

/** Session d'édition : cookie httpOnly signé (HMAC), valable 12 h. */
export const COOKIE = "cosy-session";
export const COOKIE_UI = "cosy-edition"; // simple indicateur lisible côté client (aucun droit)
const DUREE = 12 * 3600;

function secret(): string | null {
  return process.env.EDITION_SECRET || null;
}

function signer(exp: number): string {
  return crypto.createHmac("sha256", secret()!).update(String(exp)).digest("hex");
}

export function motDePasseValide(saisi: string): boolean {
  const attendu = process.env.EDITION_MOT_DE_PASSE;
  if (!attendu || !secret()) return false;
  const a = Buffer.from(saisi);
  const b = Buffer.from(attendu);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function ouvrirSession() {
  const exp = Math.floor(Date.now() / 1000) + DUREE;
  const jar = await cookies();
  const opts = { path: "/", maxAge: DUREE, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production" };
  jar.set(COOKIE, `${exp}.${signer(exp)}`, { ...opts, httpOnly: true });
  jar.set(COOKIE_UI, "1", opts);
}

export async function fermerSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
  jar.delete(COOKIE_UI);
}

export async function sessionValide(): Promise<boolean> {
  if (!secret()) return false;
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const [exp, sig] = v.split(".");
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  const attendu = signer(Number(exp));
  return sig.length === attendu.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(attendu));
}
