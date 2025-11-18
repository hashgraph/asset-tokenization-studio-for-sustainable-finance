// SPDX-License-Identifier: Apache-2.0
import { OracleRegistry } from "../model/OracleRegistry";

export interface OracleRegistryRepository {
  /**
   * Save an oracle registry (create or update)
   */
  save(registry: OracleRegistry): Promise<OracleRegistry>;

  /**
   * Find an oracle registry by ID
   */
  findById(id: string): Promise<OracleRegistry | null>;

  /**
   * Find an oracle registry by KPI contract ID
   */
  findByKpiContractId(kpiContractId: string): Promise<OracleRegistry | null>;

  /**
   * Find all oracle registries
   */
  findAll(page: number, limit: number): Promise<OracleRegistry[]>;

  /**
   * Find all active oracle registries that should execute now
   */
  findActiveForExecution(): Promise<OracleRegistry[]>;

  /**
   * Delete an oracle registry
   */
  delete(id: string): Promise<void>;

  /**
   * Count total oracle registries
   */
  count(): Promise<number>;
}
