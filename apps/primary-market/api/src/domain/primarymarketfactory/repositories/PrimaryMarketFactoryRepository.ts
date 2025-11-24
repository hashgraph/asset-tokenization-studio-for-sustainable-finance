// SPDX-License-Identifier: Apache-2.0

import { PrimaryMarketFactory } from "@domain/primarymarketfactory/model/PrimaryMarketFactory"

export interface PrimaryMarketFactoryRepository {
  save(factory: PrimaryMarketFactory): Promise<PrimaryMarketFactory>
  findByContractId(contractId: string): Promise<PrimaryMarketFactory | null>
}
