import { MockDataProvider } from "./mock-provider"
import type { HQDataProvider } from "./provider"

/**
 * Single integration point for data. Swap `MockDataProvider` for a live,
 * read-only implementation (e.g. `HermesReadOnlyProvider`) here once one is
 * separately authorised. Views only ever depend on `HQDataProvider`.
 */
const provider: HQDataProvider = new MockDataProvider()

export function getDataProvider(): HQDataProvider {
  return provider
}

export type { HQDataProvider, SourceSimulation } from "./provider"
export { DataSourceError } from "./provider"
