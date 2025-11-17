// SPDX-License-Identifier: Apache-2.0
import { PageResponse, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { BondDocumentResponse } from "@port/bond/usecase/getbonddocuments/model/BondDocumentsResponse"

export interface GetBondDocumentsPort {
  getBondDocuments(
    bondContractId: string,
    queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<BondDocumentResponse>>
}
