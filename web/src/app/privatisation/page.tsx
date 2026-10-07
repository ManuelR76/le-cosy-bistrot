import { PageOffre } from "@/components/PageOffre";
import { getContenu } from "@/lib/edition/contenu";
import { meta } from "@/lib/seo";

export const revalidate = 60;
export async function generateMetadata() {
  const m = (await getContenu()).privatisation.meta;
  return meta({ ...m, path: "/privatisation/" });
}

export default async function Page() {
  const c = await getContenu();
  return <PageOffre data={c.privatisation} cle="privatisation" path="/privatisation/" crumb="Privatisation" />;
}
