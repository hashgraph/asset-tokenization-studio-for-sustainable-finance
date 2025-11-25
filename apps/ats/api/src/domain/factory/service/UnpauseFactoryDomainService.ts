// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { FactoryRepository } from "../repositories/FactoryRepository"
import { CheckFactoryExistsDomainService } from "./CheckFactoryExistsDomainService"
import type { Factory } from "../model/Factory"

@Singleton()
export class UnpauseFactoryDomainService {
  constructor(
    private readonly checkFactoryExistsDomainService: CheckFactoryExistsDomainService,
    @Inject() private readonly factoryRepository: FactoryRepository,
  ) {}

  async execute(factoryId: string): Promise<Factory> {
    const factory = await this.checkFactoryExistsDomainService.execute(factoryId)

    factory.unpause()
    return await this.factoryRepository.save(factory)
  }
}
