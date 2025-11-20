// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { ClearingRedeem } from "../model/ClearingRedeem"
import type { ClearingRedeemRepository } from "../repository/ClearingRedeemRepository"
import { ClearingNotFoundError } from "../errors/ClearingNotFoundError"

@Singleton()
export class GetClearingRedeemByIdDomainService {
  constructor(
    @Inject("ClearingRedeemRepository")
    private readonly clearingRepository: ClearingRedeemRepository,
  ) {}

  async execute(bondContractId: string, holderAccountId: string, clearingId: number): Promise<ClearingRedeem> {
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
