import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { BondDocument } from "../model/BondDocument"

export interface BondDocumentRepository {
  save(bondDocument: BondDocument): Promise<BondDocument>
  findByContractIdAndName(contractId: string, name: string): Promise<BondDocument | null>
  findAll(pageOptions: PageOptions): Promise<Page<BondDocument>>
}
