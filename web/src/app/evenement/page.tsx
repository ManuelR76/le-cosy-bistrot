import { PageOffre } from "@/components/PageOffre";
import { evenement } from "@/content/pages";
import { getContenu } from "@/lib/edition/contenu";
import { meta } from "@/lib/seo";

export const revalidate = 60;
export const metadata = meta({ ...evenement.meta, path: "/evenement/" });

export default async function Page() {
  const c = await getContenu();
  return <PageOffre data={c.evenement} cle="evenement" path="/evenement/" crumb="Évènement" />;
}
