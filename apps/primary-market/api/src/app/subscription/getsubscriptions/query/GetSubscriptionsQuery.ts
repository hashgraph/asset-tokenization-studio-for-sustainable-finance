// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator"
import { SubscriptionQueryResponse } from "../../shared/model/SubscriptionQueryResponse"
import { Type } from "class-transformer"

export class GetSubscriptionsQuery extends Query<QueryPageResponse<SubscriptionQueryResponse>> {
  @IsNotEmpty()
  @IsString()
  readonly marketContractId: string

  @IsNumber()
  @IsNotEmpty()
  readonly offeringId: number

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(marketContractId: string, offeringId: number, pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT) {
    super()
    this.marketContractId = marketContractId
    this.offeringId = offeringId
    this.pageOptions = pageOptions
  }
}
