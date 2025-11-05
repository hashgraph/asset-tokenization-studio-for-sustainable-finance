import { Treasury } from "@domain/treasury/model/Treasury"
import type { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

export interface TreasuryRepository {
  save(treasury: Treasury): Promise<Treasury>

  findByContractId(contractId: string): Promise<Treasury | null>

  findByBondContractId(bondContractId: string): Promise<Treasury | null>

  findAll(pageOptions: PageOptions): Promise<Page<Treasury>>
}
