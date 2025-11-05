// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, ValidateNested } from "class-validator"
import { PrimaryMarketBondQueryResponse } from "./PrimaryMarketBondQueryResponse"
import { Type } from "class-transformer"

export class GetPrimaryMarketBondsQuery extends Query<QueryPageResponse<PrimaryMarketBondQueryResponse>> {
  @IsNotEmpty()
  @IsString()
  readonly marketId: string

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(marketId: string, pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT) {
    super()
    this.marketId = marketId
    this.pageOptions = pageOptions
  }
}
