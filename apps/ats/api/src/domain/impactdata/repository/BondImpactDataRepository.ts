// SPDX-License-Identifier: Apache-2.0
import { BondImpactData } from "@domain/impactdata/model/BondImpactData"

export interface BondImpactDataRepository {
  save(impactData: BondImpactData): Promise<BondImpactData>
  findByContractId(bondContractId: string): Promise<BondImpactData | null>
}
