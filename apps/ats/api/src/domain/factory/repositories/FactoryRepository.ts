// SPDX-License-Identifier: Apache-2.0

import { Factory } from "@domain/factory/model/Factory"

export interface FactoryRepository {
  save(factory: Factory): Promise<Factory>
  findByFactoryId(factoryId: string): Promise<Factory | null>
}
