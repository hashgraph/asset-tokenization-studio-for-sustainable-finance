// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { BondQueryResponse } from "./BondQueryResponse"

export class GetBondsQuery extends Query<QueryPageResponse<BondQueryResponse>> {
  constructor(public readonly pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT) {
    super()
  }
}
