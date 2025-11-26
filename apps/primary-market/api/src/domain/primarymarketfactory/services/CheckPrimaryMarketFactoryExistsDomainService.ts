// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { PrimaryMarketFactory } from "../model/PrimaryMarketFactory"
import type { PrimaryMarketFactoryRepository } from "../repositories/PrimaryMarketFactoryRepository"
import { PrimaryMarketFactoryNotFoundError } from "../errors/PrimaryMarketFactoryNotFoundError"

@Singleton()
export class CheckPrimaryMarketFactoryExistsDomainService {
  constructor(
    @Inject("PrimaryMarketFactoryRepository")
    private readonly primaryMarketFactoryRepository: PrimaryMarketFactoryRepository,
  ) {}

  async execute(factoryContractId: string): Promise<PrimaryMarketFactory> {
    const factory = await this.primaryMarketFactoryRepository.findByContractId(factoryContractId)

    if (!factory) {
      throw PrimaryMarketFactoryNotFoundError.factoryIdError(factoryContractId)
    }

    return factory
  }
}
