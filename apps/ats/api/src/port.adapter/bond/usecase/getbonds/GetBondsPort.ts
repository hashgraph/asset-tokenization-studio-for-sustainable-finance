// SPDX-License-Identifier: Apache-2.0

import { PageOptionsRequest } from '@hashgraph/green-bonds-shared-core'
import { BondQueryResponse } from '@app/bond/getbonds/query/BondQueryResponse'

export interface GetBondsPort {
  getBonds(pageOptionsRequest: PageOptionsRequest): Promise<BondQueryResponse>
}
