// SPDX-License-Identifier: Apache-2.0
import { BondInterestRate } from "@domain/interestrate/model/BondInterestRate"

export interface BondInterestRateRepository {
  save(interestRate: BondInterestRate): Promise<BondInterestRate>
  findByContractId(bondContractId: string): Promise<BondInterestRate | null>
}
