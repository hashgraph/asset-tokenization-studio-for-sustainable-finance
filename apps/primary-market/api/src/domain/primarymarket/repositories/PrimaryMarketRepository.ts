// SPDX-License-Identifier: Apache-2.0

import { PrimaryMarket } from "@domain/primarymarket/model/PrimaryMarket"

export interface PrimaryMarketRepository {
  findByContractId(contractId: string): Promise<PrimaryMarket | null>
}
