import { lirePhotoLocale } from "@/lib/edition/store";

const TYPES: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };

/** Photos envoyées par le client en mode disque (Hostinger). */
export async function GET(_: Request, { params }: { params: Promise<{ nom: string }> }) {
  const { nom } = await params;
  const data = await lirePhotoLocale(nom);
  if (!data) return new Response("Introuvable", { status: 404 });
  const ext = nom.split(".").pop()?.toLowerCase() ?? "";
  return new Response(new Uint8Array(data), {
    headers: { "Content-Type": TYPES[ext] ?? "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
