// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { PrimaryMarket } from "../model/PrimaryMarket"
import type { PrimaryMarketRepository } from "../repositories/PrimaryMarketRepository"
import { PrimaryMarketNotFoundError } from "../errors/PrimaryMarketNotFoundError"

@Singleton()
export class CheckPrimaryMarketExistsDomainService {
  constructor(@Inject() private readonly primaryMarketRepository: PrimaryMarketRepository) {}

  async execute(marketContractId: string): Promise<PrimaryMarket> {
    const market = await this.primaryMarketRepository.findByContractId(marketContractId)

    if (!market) {
      throw PrimaryMarketNotFoundError.contractIdError(marketContractId)
    }

    return market
  }
}
