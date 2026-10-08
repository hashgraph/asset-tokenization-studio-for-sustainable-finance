import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { Bond } from "../model/Bond"

export interface BondRepository {
  save(bond: Bond): Promise<Bond>
  findByContractId(contractId: string): Promise<Bond | null>
  findAll(pageOptions: PageOptions): Promise<Page<Bond>>
}
