// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { Factory } from "../model/Factory"
import type { FactoryRepository } from "../repositories/FactoryRepository"
import { FactoryNotFoundError } from "../errors/FactoryNotFoundError"

@Singleton()
export class CheckFactoryExistsDomainService {
  constructor(@Inject("FactoryRepository") private readonly factoryRepository: FactoryRepository) {}

  async execute(factoryId: string): Promise<Factory> {
    const factory = await this.factoryRepository.findByFactoryId(factoryId)

    if (!factory) {
      throw FactoryNotFoundError.factoryIdError(factoryId)
    }

    return factory
  }
}
