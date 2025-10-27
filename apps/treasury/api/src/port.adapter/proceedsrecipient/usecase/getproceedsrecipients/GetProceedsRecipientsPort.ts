// SPDX-License-Identifier: Apache-2.0

import { PageResponse, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { ProceedsRecipientResponse } from "./model/ProceedsRecipientResponse"

export interface GetProceedsRecipientsPort {
  getProceedsRecipients(
    treasuryContractId: string,
    queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<ProceedsRecipientResponse>>
}
