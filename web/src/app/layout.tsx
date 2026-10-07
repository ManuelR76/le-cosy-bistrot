import type { Metadata, Viewport } from "next";
import { Analytics } from "@/components/Analytics";
import { BandeauCookies } from "@/components/BandeauCookies";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { mediaUrl } from "@/lib/media";
import { site } from "@/site.config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.name,
  // Favicon d'origine (médiathèque WP). TODO : copier dans /public après bascule.
  icons: {
    icon: [
      { url: mediaUrl("/wp-content/uploads/2024/02/Favicon-cosy-150x150.png"), sizes: "32x32" },
      { url: mediaUrl("/wp-content/uploads/2024/02/Favicon-cosy-300x300.png"), sizes: "192x192" },
    ],
    apple: mediaUrl("/wp-content/uploads/2024/02/Favicon-cosy-300x300.png"),
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};

export const viewport: Viewport = { themeColor: "#111111" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-FR">
      <body className="flex min-h-dvh flex-col">
        <Header />
        <main id="contenu" className="flex-1">
          {children}
        </main>
        <Footer />
        <BandeauCookies />
        <Analytics />
      </body>
    </html>
  );
}
