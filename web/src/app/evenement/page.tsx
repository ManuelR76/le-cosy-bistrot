import { PageOffre } from "@/components/PageOffre";
import { evenement } from "@/content/pages";
import { meta } from "@/lib/seo";

export const metadata = meta({ ...evenement.meta, path: "/evenement/" });

export default function Page() {
  return <PageOffre data={evenement} path="/evenement/" crumb="Évènement" />;
}
