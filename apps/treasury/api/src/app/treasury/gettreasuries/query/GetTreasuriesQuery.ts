// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { TreasuryQueryResponse } from "./TreasuryQueryResponse"

export class GetTreasuriesQuery extends Query<QueryPageResponse<TreasuryQueryResponse>> {
  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT) {
    super()
    this.pageOptions = pageOptions
  }
}
