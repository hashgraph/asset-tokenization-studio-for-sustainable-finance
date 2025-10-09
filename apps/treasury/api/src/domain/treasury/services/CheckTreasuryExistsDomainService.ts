// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { Treasury } from "@domain/treasury/model/Treasury"
import type { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"

@Singleton()
export class CheckTreasuryExistsDomainService {
  constructor(@Inject() private readonly treasuryRepository: TreasuryRepository) {}

  async execute(bondContractId: string): Promise<Treasury> {
    const treasury = await this.treasuryRepository.findByBondContractId(bondContractId)
    if (!treasury) {
      throw TreasuryNotFoundError.bondContractIdError(bondContractId)
    }
    return treasury
  }
}
