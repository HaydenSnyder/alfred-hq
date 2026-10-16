import type { Metadata } from "next"
import { CompaniesDirectoryView } from "@/features/companies/companies-directory-view"

export const metadata: Metadata = { title: "Companies" }

export default function CompaniesPage() {
  return <CompaniesDirectoryView />
}
