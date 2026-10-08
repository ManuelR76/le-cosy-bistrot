"use client";

import Script from "next/script";
import { useConsent } from "./consent";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/** GA4 (même propriété que le site d'origine) chargé uniquement après consentement. */
export function Analytics() {
  const consent = useConsent();
  if (!GA_ID || consent !== "granted") return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});
gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}
