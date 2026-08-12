import { CustomerDetailPageView } from "@/features/customers/components/customer-detail-page-view";

type CustomerDetailPageProps = {
  params: Promise<{ phone: string }>;
};

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { phone } = await params;
  return <CustomerDetailPageView phoneRouteParam={phone} />;
}
