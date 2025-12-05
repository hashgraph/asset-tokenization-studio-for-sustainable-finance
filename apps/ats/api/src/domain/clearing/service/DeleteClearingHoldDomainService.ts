// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { ClearingHold } from "../model/ClearingHold"
import type { ClearingHoldRepository } from "../repository/ClearingHoldRepository"
import { ClearingNotFoundError } from "../errors/ClearingNotFoundError"
import { DeleteClearingDomainServiceRequest } from "./model/DeleteClearingDomainServiceRequest"

@Singleton()
export class DeleteClearingHoldDomainService {
  constructor(
    @Inject("ClearingHoldRepository")
    private readonly clearingRepository: ClearingHoldRepository,
  ) {}

  async execute(request: DeleteClearingDomainServiceRequest): Promise<ClearingHold> {
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
