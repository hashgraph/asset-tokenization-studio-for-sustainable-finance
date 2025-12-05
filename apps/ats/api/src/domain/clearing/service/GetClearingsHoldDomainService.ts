// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { ClearingHold } from "../model/ClearingHold"
import type { ClearingHoldRepository } from "../repository/ClearingHoldRepository"

@Singleton()
export class GetClearingsHoldDomainService {
  constructor(
    @Inject("ClearingHoldRepository")
    private readonly clearingRepository: ClearingHoldRepository,
  ) {}

  async execute(bondContractId: string, holderAccountId: string, options: PageOptions): Promise<Page<ClearingHold>> {
    return await this.clearingRepository.findAllByHolder(bondContractId, holderAccountId, options)
  }
}
