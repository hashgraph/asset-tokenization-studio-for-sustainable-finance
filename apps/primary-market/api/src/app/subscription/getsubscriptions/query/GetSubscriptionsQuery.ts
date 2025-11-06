// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, IsString, ValidateNested } from "class-validator"
import { SubscriptionQueryResponse } from "../../shared/model/SubscriptionQueryResponse"
import { Type } from "class-transformer"

export class GetSubscriptionsQuery extends Query<QueryPageResponse<SubscriptionQueryResponse>> {
  @IsNotEmpty()
  @IsString()
  readonly marketContractId: string

  @IsNotEmpty()
  @IsNumberString()
  readonly offeringDltId: string

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(
    marketContractId: string,
    offeringDltId: string,
    pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT,
  ) {
    super()
    this.marketContractId = marketContractId
    this.offeringDltId = offeringDltId
    this.pageOptions = pageOptions
  }
}
