// SPDX-License-Identifier: Apache-2.0

import { GetPrimaryMarketFactoryResponse } from "./model/GetPrimaryMarketFactoryResponse"

export interface GetPrimaryMarketFactoryPort {
  getPrimaryMarketFactory(factoryContractId: string): Promise<GetPrimaryMarketFactoryResponse>
}
