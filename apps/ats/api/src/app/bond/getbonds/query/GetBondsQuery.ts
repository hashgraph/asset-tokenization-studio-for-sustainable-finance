// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions } from "@hashgraph/green-bonds-shared-core"
import { BondQueryResponse } from "./BondQueryResponse"

export class GetBondsQuery extends Query<BondQueryResponse> {
  constructor(public readonly pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT) {
    super()
  }
}
