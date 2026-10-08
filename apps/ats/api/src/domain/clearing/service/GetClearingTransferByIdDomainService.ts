// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { ClearingTransfer } from "../model/ClearingTransfer"
import type { ClearingTransferRepository } from "../repository/ClearingTransferRepository"
import { ClearingNotFoundError } from "../errors/ClearingNotFoundError"

@Singleton()
export class GetClearingTransferByIdDomainService {
  constructor(
    @Inject("ClearingTransferRepository")
    private readonly clearingRepository: ClearingTransferRepository,
  ) {}

  async execute(bondContractId: string, holderAccountId: string, clearingId: number): Promise<ClearingTransfer> {
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
