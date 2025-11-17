// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { ClearingHold } from "../model/ClearingHold"
import type { ClearingHoldRepository } from "../repository/ClearingHoldRepository"
import { ClearingNotFoundError } from "../errors/ClearingNotFoundError"

@Singleton()
export class GetClearingHoldByIdDomainService {
  constructor(
    @Inject("ClearingHoldRepository")
    private readonly clearingRepository: ClearingHoldRepository,
  ) {}

  async execute(bondContractId: string, holderAccountId: string, clearingId: number): Promise<ClearingHold> {
    const clearing = await this.clearingRepository.findByContractIdHolderAccountIdAndId(
      bondContractId,
      holderAccountId,
      clearingId,
    )

    if (!clearing) {
      throw new ClearingNotFoundError(`${bondContractId}/${holderAccountId}/${clearingId}`)
    }

    return clearing
  }
}
