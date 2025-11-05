// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, IsString, ValidateNested } from "class-validator"
import { SubscriptionQueryResponse } from "../../shared/model/SubscriptionQueryResponse"
import { Type } from "class-transformer"

export class GetSubscriptionsQuery extends Query<QueryPageResponse<SubscriptionQueryResponse>> {
  @IsNotEmpty()
  @IsString()
  readonly marketId: string

  @IsNotEmpty()
  @IsNumberString()
  readonly offeringId: string

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(marketId: string, offeringId: string, pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT) {
    super()
    this.marketId = marketId
    this.offeringId = offeringId
    this.pageOptions = pageOptions
  }
}
