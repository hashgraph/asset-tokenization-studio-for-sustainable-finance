// SPDX-License-Identifier: Apache-2.0
import { PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { BondDocumentResponse } from "@port/document/usecase/getbonddocuments/model/BondDocumentsResponse"

export interface GetBondDocumentsPort {
  getBondDocuments(
    bondContractId: string,
    pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<BondDocumentResponse>>
}
