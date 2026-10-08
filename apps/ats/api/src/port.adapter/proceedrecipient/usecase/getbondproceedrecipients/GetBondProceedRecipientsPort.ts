// SPDX-License-Identifier: Apache-2.0
import { PageOptionsRequest, PageResponse } from "@hashgraph/green-bonds-shared-core"
import { BondProceedRecipientsResponse } from "./model/BondProceedRecipientsResponse"

export interface GetBondProceedRecipientsPort {
  getBondProceedRecipients(
    bondContractId: string,
    pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<BondProceedRecipientsResponse>>
}
