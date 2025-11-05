// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { ValidateNested } from "class-validator"
import { PrimaryMarketQueryResponse } from "@app/primarymarket/shared/model/PrimaryMarketQueryResponse"
import { Type } from "class-transformer"

export class GetPrimaryMarketsQuery extends Query<QueryPageResponse<PrimaryMarketQueryResponse>> {
  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT) {
    super()
    this.pageOptions = pageOptions
  }
}
