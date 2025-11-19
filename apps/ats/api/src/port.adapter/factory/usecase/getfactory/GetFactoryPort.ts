// SPDX-License-Identifier: Apache-2.0

import type { GetFactoryResponse } from "@port/factory/usecase/getfactory/model/GetFactoryResponse"

export interface GetFactoryPort {
  getFactory(factoryId: string): Promise<GetFactoryResponse>
}
