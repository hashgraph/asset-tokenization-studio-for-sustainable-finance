// SPDX-License-Identifier: Apache-2.0

import { Query } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"
import { PrimaryMarketQueryResponse } from "@app/primarymarket/shared/model/PrimaryMarketQueryResponse"

export class GetPrimaryMarketQuery extends Query<PrimaryMarketQueryResponse> {
  @IsNotEmpty()
  @IsString()
  readonly marketContractId: string

  constructor(marketContractId: string) {
    super()
    this.marketContractId = marketContractId
  }
}
