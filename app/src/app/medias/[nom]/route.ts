import { lirePhoto } from "@/lib/edition/store";

const TYPES: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };

/** Photos envoyées par le client (Blob privé sur Vercel, disque sur Hostinger). Noms horodatés : cache immuable. */
export async function GET(_: Request, { params }: { params: Promise<{ nom: string }> }) {
  const { nom } = await params;
  const photo = await lirePhoto(nom);
  if (!photo) return new Response("Introuvable", { status: 404 });
  const ext = nom.split(".").pop()?.toLowerCase() ?? "";
  return new Response(new Uint8Array(photo.data), {
    headers: { "Content-Type": photo.type || TYPES[ext] || "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
