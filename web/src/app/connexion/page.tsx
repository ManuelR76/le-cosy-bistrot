import type { Metadata } from "next";
import { Formulaire } from "./Formulaire";

export const metadata: Metadata = { title: { absolute: "Modifier le site - Le Cosy Bistrot" }, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <section className="conteneur max-w-[560px]! py-[100px]">
      <h1 className="titre-1">Modifier le site</h1>
      <p className="mt-5">
        Connectez-vous, puis cliquez sur un texte pour le réécrire ou sur « Changer les photos ». Pensez à enregistrer avant de
        quitter.
      </p>
      <Formulaire />
    </section>
  );
}
