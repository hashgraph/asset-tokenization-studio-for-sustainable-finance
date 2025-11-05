// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { PrimaryMarketBondOfferingQueryResponse } from "./PrimaryMarketBondOfferingQueryResponse"

export class GetPrimaryMarketBondOfferingsQuery extends Query<
  QueryPageResponse<PrimaryMarketBondOfferingQueryResponse>
> {
  @IsNotEmpty()
  @IsString()
  readonly marketId: string

  @IsNotEmpty()
  @IsString()
  readonly bondId: string

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(marketId: string, bondId: string, pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT) {
    super()
    this.marketId = marketId
    this.bondId = bondId
    this.pageOptions = pageOptions
  }
}
