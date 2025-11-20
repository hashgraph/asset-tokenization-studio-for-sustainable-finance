// SPDX-License-Identifier: Apache-2.0
import { PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { ClearingTransferQueryResponse } from "@app/bond/getclearingstransfer/query/ClearingTransferQueryResponse"

export interface GetClearingsTransferPort {
  getClearingsTransfer(
    bondContractId: string,
    holderAccountId: string,
    pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<ClearingTransferQueryResponse>>
}
