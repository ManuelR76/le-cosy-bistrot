import { PageOffre } from "@/components/PageOffre";
import { privatisation } from "@/content/pages";
import { getContenu } from "@/lib/edition/contenu";
import { meta } from "@/lib/seo";

export const revalidate = 60;
export const metadata = meta({ ...privatisation.meta, path: "/privatisation/" });

export default async function Page() {
  const c = await getContenu();
  return <PageOffre data={c.privatisation} cle="privatisation" path="/privatisation/" crumb="Privatisation" />;
}
