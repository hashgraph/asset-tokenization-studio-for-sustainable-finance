// SPDX-License-Identifier: Apache-2.0

import { PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { ProceedsRecipientResponse } from "./model/ProceedsRecipientResponse"

export interface GetProceedsRecipientsPort {
  getProceedsRecipients(
    treasuryContractId: string,
    pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<ProceedsRecipientResponse>>
}
