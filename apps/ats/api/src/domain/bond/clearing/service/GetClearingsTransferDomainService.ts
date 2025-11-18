// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { ClearingTransfer } from "../model/ClearingTransfer"
import type { ClearingTransferRepository } from "../repository/ClearingTransferRepository"

@Singleton()
export class GetClearingsTransferDomainService {
  constructor(
    @Inject("ClearingTransferRepository")
    private readonly clearingRepository: ClearingTransferRepository,
  ) {}

  async execute(
    bondContractId: string,
    holderAccountId: string,
    options: PageOptions,
  ): Promise<Page<ClearingTransfer>> {
    return await this.clearingRepository.findAllByHolder(bondContractId, holderAccountId, options)
  }
}
