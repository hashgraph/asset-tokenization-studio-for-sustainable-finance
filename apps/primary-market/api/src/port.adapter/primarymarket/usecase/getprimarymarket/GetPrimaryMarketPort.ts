// SPDX-License-Identifier: Apache-2.0

import { PrimaryMarketResponse } from "@port/primarymarket/shared/model/PrimaryMarketResponse"

export interface GetPrimaryMarketPort {
  getPrimaryMarket(marketContractId: string): Promise<PrimaryMarketResponse>
}
