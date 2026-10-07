import { PageShell, ShopPage } from "../../components/Storefront";

type Param = string | string[] | undefined;
const first = (value: Param) => (Array.isArray(value) ? value[0] || "" : value || "");

export default async function Shop({ searchParams }: { searchParams: Promise<{ q?: Param; sort?: Param; deals?: Param }> }) {
  const params = await searchParams;
  return <PageShell><ShopPage initialQuery={first(params.q)} initialSort={first(params.sort)} dealsOnly={first(params.deals) === "1"} /></PageShell>;
}
