// SPDX-License-Identifier: Apache-2.0

import { BondQueryResponse } from "@app/bond/getbonds/query/BondQueryResponse"
import { QueryPageRequest } from "@hashgraph/green-bonds-shared-core"

export interface GetBondsPort {
  getBonds(queryPageRequest: QueryPageRequest): Promise<BondQueryResponse>
}
