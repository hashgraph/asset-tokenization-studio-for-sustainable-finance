// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, ValidateNested } from "class-validator"
import { SubscriptionQueryResponse } from "../../shared/model/SubscriptionQueryResponse"
import { Type } from "class-transformer"

export class GetSubscriptionsByInvestorQuery extends Query<QueryPageResponse<SubscriptionQueryResponse>> {
  @IsNotEmpty()
  @IsString()
  readonly investorAccountId: string

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(investorAccountId: string, pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT) {
    super()
    this.investorAccountId = investorAccountId
    this.pageOptions = pageOptions
  }
}
