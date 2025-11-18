// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { ClearingRedeem } from "../model/ClearingRedeem"
import type { ClearingRedeemRepository } from "../repository/ClearingRedeemRepository"

@Singleton()
export class GetClearingsRedeemDomainService {
  constructor(
    @Inject("ClearingRedeemRepository")
    private readonly clearingRepository: ClearingRedeemRepository,
  ) {}

  async execute(bondContractId: string, holderAccountId: string, options: PageOptions): Promise<Page<ClearingRedeem>> {
    return await this.clearingRepository.findAllByHolder(bondContractId, holderAccountId, options)
  }
}
