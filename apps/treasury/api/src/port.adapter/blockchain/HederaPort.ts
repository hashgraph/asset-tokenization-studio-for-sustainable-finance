// SPDX-License-Identifier: Apache-2.0

import { QueryPageRequest, PageResponse } from "@hashgraph/green-bonds-shared-core"

export interface HederaPort {
  getTokenBalance(tokenId: string, accountId: string): Promise<string>
  getNFTs(tokenId: string, accountId: string, queryPageRequest: QueryPageRequest): Promise<PageResponse<any>>
}
