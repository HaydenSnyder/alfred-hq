"use client"

import { useMemo } from "react"
import type { Agent, Company } from "@/lib/types"
import { useHQQuery } from "./use-hq-query"

/** Lookup tables for rendering names from ids across screens. */
export function useDirectory() {
  const q = useHQQuery("directory", async (p) => {
    const [companies, agents] = await Promise.all([p.listCompanies(), p.listAgents()])
    return { companies, agents }
  })

  return useMemo(() => {
    const companies = q.data?.companies ?? []
    const agents = q.data?.agents ?? []
    const companyById = new Map<string, Company>(companies.map((c) => [c.id, c]))
    const agentById = new Map<string, Agent>(agents.map((a) => [a.id, a]))
    return { status: q.status, companies, agents, companyById, agentById }
  }, [q.data, q.status])
}
