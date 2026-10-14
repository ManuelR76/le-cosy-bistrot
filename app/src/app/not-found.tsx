import Link from "next/link";

export default function NotFound() {
  return (
    <section className="conteneur py-[100px] text-center">
      <h1 className="titre-1">Page introuvable</h1>
      <p className="mt-5">La page demandée n’existe pas ou a été déplacée.</p>
      <Link href="/" className="btn mt-8">
        Retour à l’accueil
      </Link>
    </section>
  );
}
