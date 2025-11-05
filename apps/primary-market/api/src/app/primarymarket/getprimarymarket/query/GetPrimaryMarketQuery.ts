// SPDX-License-Identifier: Apache-2.0

import { Query } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"
import { PrimaryMarketQueryResponse } from "@app/primarymarket/shared/model/PrimaryMarketQueryResponse"

export class GetPrimaryMarketQuery extends Query<PrimaryMarketQueryResponse> {
  @IsNotEmpty()
  @IsString()
  readonly marketId: string

  constructor(marketId: string) {
    super()
    this.marketId = marketId
  }
}
