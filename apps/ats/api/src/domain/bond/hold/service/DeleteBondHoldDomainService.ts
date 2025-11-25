// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { BondHoldRepository } from "../repository/BondHoldRepository"
import { DeleteBondHoldDomainServiceRequest } from "./model/DeleteBondHoldDomainServiceRequest"
import { BondHoldNotFoundError } from "@domain/bond/hold/errors/BondHoldNotFoundError"

@Singleton()
export class DeleteBondHoldDomainService {
  constructor(@Inject() private readonly bondHoldRepository: BondHoldRepository) {}

  async execute(request: DeleteBondHoldDomainServiceRequest): Promise<void> {
    const existingHold = await this.bondHoldRepository.findByContractIdAndHolderAndHoldId(
      request.contractId,
      request.holderAccountId,
      request.holdId,
    )

    if (!existingHold) {
      throw BondHoldNotFoundError.withId(request.contractId, request.holderAccountId, request.holdId)
    }

    await this.bondHoldRepository.deleteByIdAndContractIdAndHolderAccountId(
      request.holdId,
      request.contractId,
      request.holderAccountId,
    )
  }
}
