import { PageOffre } from "@/components/PageOffre";
import { privatisation } from "@/content/pages";
import { meta } from "@/lib/seo";

export const metadata = meta({ ...privatisation.meta, path: "/privatisation/" });

export default function Page() {
  return <PageOffre data={privatisation} path="/privatisation/" crumb="Privatisation" />;
}
