// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { ClearingRedeem } from "../model/ClearingRedeem"
import type { ClearingRedeemRepository } from "../repository/ClearingRedeemRepository"
import { ClearingNotFoundError } from "../errors/ClearingNotFoundError"
import { DeleteClearingDomainServiceRequest } from "./model/DeleteClearingDomainServiceRequest"

@Singleton()
export class DeleteClearingRedeemDomainService {
  constructor(
    @Inject("ClearingRedeemRepository")
    private readonly clearingRepository: ClearingRedeemRepository,
  ) {}

  async execute(request: DeleteClearingDomainServiceRequest): Promise<ClearingRedeem> {
    const clearing = await this.clearingRepository.findByContractIdHolderAccountIdAndId(
      request.bondContractId,
      request.holderAccountId,
      request.clearingId,
    )

    if (!clearing) {
      throw new ClearingNotFoundError(`${request.bondContractId}/${request.holderAccountId}/${request.clearingId}`)
    }

    await this.clearingRepository.deleteByCompositeKey(
      request.bondContractId,
      request.holderAccountId,
      request.clearingId,
    )

    return clearing
  }
}
