import { PageShell, ProductPage } from "../../../components/Storefront";

export default async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PageShell><ProductPage slug={slug} /></PageShell>;
}
