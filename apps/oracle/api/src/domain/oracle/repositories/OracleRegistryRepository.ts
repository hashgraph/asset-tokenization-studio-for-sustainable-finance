// SPDX-License-Identifier: Apache-2.0
import { PageOptions, Page } from "@hashgraph/green-bonds-shared-core"
import { OracleRegistry } from "../model/OracleRegistry"

export interface OracleRegistryRepository {
  /**
   * Save an oracle registry (create or update)
   */
  save(registry: OracleRegistry): Promise<OracleRegistry>

  /**
   * Find an oracle registry by ID
   */
  findById(id: string): Promise<OracleRegistry | null>

  /**
   * Find an oracle registry by KPI contract ID
   */
  findByKpiContractId(kpiContractId: string): Promise<OracleRegistry | null>

  /**
   * Find all oracle registries with pagination
   */
  findAll(pageOptions: PageOptions): Promise<Page<OracleRegistry>>

  /**
   * Find all active oracle registries that should execute now
   */
  findActiveForExecution(): Promise<OracleRegistry[]>

  /**
   * Delete an oracle registry
   */
  delete(id: string): Promise<void>
}
