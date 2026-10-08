// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { PrimaryMarketRepository } from "../repositories/PrimaryMarketRepository"
import { PrimaryMarket } from "../model/PrimaryMarket"
import { DeployPrimaryMarketDomainServiceRequest } from "./model/DeployPrimaryMarketDomainServiceRequest"
import { PrimaryMarketFoundError } from "../errors/PrimaryMarketFoundError"

@Singleton()
export class DeployPrimaryMarketDomainService {
  constructor(@Inject() private readonly primaryMarketRepository: PrimaryMarketRepository) {}

  async execute(request: DeployPrimaryMarketDomainServiceRequest): Promise<PrimaryMarket> {
    const existingPrimaryMarket = await this.primaryMarketRepository.findByContractId(request.contractId)

    if (existingPrimaryMarket) {
      throw PrimaryMarketFoundError.contractIdError(request.contractId)
    }

    const primaryMarket = Object.assign(new PrimaryMarket(), {
      contractId: request.contractId,
      isPaused: false,
    })

    return await this.primaryMarketRepository.save(primaryMarket)
  }
}
