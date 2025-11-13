// SPDX-License-Identifier: Apache-2.0
import { QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { BondDocumentsResponse } from "@port/bond/usecase/getbonddocuments/model/BondDocumentsResponse"

export interface GetBondDocumentsPort {
  getBondDocuments(bondContractId: string, queryPageRequest: QueryPageRequest): Promise<BondDocumentsResponse>
}
