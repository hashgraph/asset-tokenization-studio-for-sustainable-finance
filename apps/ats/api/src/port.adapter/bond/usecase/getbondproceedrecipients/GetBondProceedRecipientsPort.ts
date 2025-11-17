// SPDX-License-Identifier: Apache-2.0
import { QueryPageRequest, PageResponse } from "@hashgraph/green-bonds-shared-core"
import { BondProceedRecipientsResponse } from "./model/BondProceedRecipientsResponse"

export interface GetBondProceedRecipientsPort {
  getBondProceedRecipients(
    bondContractId: string,
    queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<BondProceedRecipientsResponse>>
}
