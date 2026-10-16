import { IntegrationDetailView } from "@/features/integrations/integration-detail-view"

export const metadata = { title: "Integration" }

export default async function IntegrationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <IntegrationDetailView id={id} />
}
