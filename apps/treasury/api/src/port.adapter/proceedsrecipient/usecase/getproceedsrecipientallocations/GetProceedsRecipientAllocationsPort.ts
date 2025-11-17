// SPDX-License-Identifier: Apache-2.0

import { PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { ProceedsRecipientAllocationResponse } from "./model/ProceedsRecipientAllocationResponse"

export interface GetProceedsRecipientAllocationsPort {
  getProceedsRecipientAllocations(
    treasuryContractId: string,
    recipientContractId: string,
    queryPageRequest: PageOptionsRequest,
  ): Promise<PageResponse<ProceedsRecipientAllocationResponse>>
}
