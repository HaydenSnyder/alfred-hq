import type { Metadata } from "next"
import { CompanyOverviewView } from "@/features/companies/company-overview-view"

export const metadata: Metadata = { title: "Company" }

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <CompanyOverviewView id={id} />
}
