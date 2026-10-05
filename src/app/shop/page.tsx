import { PageShell, ShopPage } from "../../components/Storefront";

export default async function Shop({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const params = await searchParams;
  const query = Array.isArray(params.q) ? params.q[0] || "" : params.q || "";
  return <PageShell><ShopPage initialQuery={query} /></PageShell>;
}
