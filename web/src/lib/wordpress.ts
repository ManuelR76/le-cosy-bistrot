/**
 * Accès WordPress headless (WPGraphQL). Chaque fonction renvoie null si l'API
 * n'est pas configurée ou ne répond pas : l'appelant retombe alors sur le
 * contenu statique de src/content (le site ne tombe jamais pour ça).
 */
const API = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
export const REVALIDATE = 60;

async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T | null> {
  if (!API) return null;
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: REVALIDATE, tags: ["wordpress"] },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: T; errors?: unknown };
    return json.errors || !json.data ? null : json.data;
  } catch {
    return null;
  }
}

export type WpPost = {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  modified: string;
  featuredImage: { node: { sourceUrl: string; altText: string } } | null;
  categories: { nodes: { name: string }[] };
  seo: { title: string | null; description: string | null } | null;
};

const POST_FIELDS = `slug title content excerpt date modified
  featuredImage { node { sourceUrl altText } }
  categories { nodes { name } }
  seo { title description }`;

export async function wpPosts(): Promise<WpPost[] | null> {
  const d = await gql<{ posts: { nodes: WpPost[] } }>(
    `query { posts(first: 100, where: { status: PUBLISH }) { nodes { ${POST_FIELDS} } } }`,
  );
  return d?.posts.nodes ?? null;
}

export async function wpPage(uri: string): Promise<{ title: string; content: string; modified: string } | null> {
  const d = await gql<{ page: { title: string; content: string; modified: string } | null }>(
    `query($id: ID!) { page(id: $id, idType: URI) { title content modified } }`,
    { id: uri },
  );
  return d?.page ?? null;
}
