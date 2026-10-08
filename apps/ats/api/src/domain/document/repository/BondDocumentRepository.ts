// SPDX-License-Identifier: Apache-2.0
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { BondDocument } from "../model/BondDocument"

export interface BondDocumentRepository {
  save(bondDocument: BondDocument): Promise<BondDocument>
  findByContractIdAndName(bondContractId: string, name: string): Promise<BondDocument | null>
  findAllByContractIdPaginated(bondContractId: string, pageOptions: PageOptions): Promise<Page<BondDocument>>
  delete(bondDocument: BondDocument): Promise<void>
}
