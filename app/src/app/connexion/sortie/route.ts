import { NextResponse } from "next/server";
import { COOKIE, COOKIE_UI } from "@/lib/edition/auth";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/", req.url), 303);
  res.cookies.delete(COOKIE);
  res.cookies.delete(COOKIE_UI);
  return res;
}
