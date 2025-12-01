// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { OfferingQueryResponse } from "./OfferingQueryResponse"

export class GetOfferingsQuery extends Query<QueryPageResponse<OfferingQueryResponse>> {
  @IsNotEmpty()
  @IsString()
  readonly marketContractId: string

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(marketContractId: string, pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT) {
    super()
    this.marketContractId = marketContractId
    this.pageOptions = pageOptions
  }
}
