// SPDX-License-Identifier: Apache-2.0

import { Query } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"
import type { PrimaryMarketFactoryQueryResponse } from "./PrimaryMarketFactoryQueryResponse"

export class GetPrimaryMarketFactoryQuery extends Query<PrimaryMarketFactoryQueryResponse> {
  @IsNotEmpty()
  @IsString()
  readonly factoryContractId: string

  constructor(factoryContractId: string) {
    super()
    this.factoryContractId = factoryContractId
  }
}
