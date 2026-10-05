import { PageShell, ShopPage } from "../../../components/Storefront";

export default async function CategoryShop({ params, searchParams }: { params: Promise<{ category: string }>; searchParams: Promise<{ q?: string | string[] }> }) {
  const { category } = await params;
  const queryParams = await searchParams;
  const query = Array.isArray(queryParams.q) ? queryParams.q[0] || "" : queryParams.q || "";
  return <PageShell><ShopPage category={category} initialQuery={query} /></PageShell>;
}
