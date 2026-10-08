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
  readonly marketContractId: string

  @IsNotEmpty()
  @IsString()
  readonly bondContractId: string

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(
    marketContractId: string,
    bondContractId: string,
    pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT,
  ) {
    super()
    this.marketContractId = marketContractId
    this.bondContractId = bondContractId
    this.pageOptions = pageOptions
  }
}
