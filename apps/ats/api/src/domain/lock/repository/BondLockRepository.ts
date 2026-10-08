import { BondLock } from "../model/BondLock"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

export interface BondLockRepository {
  save(bondLock: BondLock, transactionId?: string): Promise<BondLock>
  findByBondContractIdAndId(bondContractId: string, id: number): Promise<BondLock | null>
  findByBondContractIdAndHolderAccountIdPaginated(
    bondContractId: string,
    holderAccountId: string,
    pageOptions: PageOptions,
  ): Promise<Page<BondLock>>
  findByBondContractIdAndHolderAccountIdAndId(
    bondContractId: string,
    holderAccountId: string,
    id: number,
  ): Promise<BondLock | null>
  delete(bondContractId: string, id: number): Promise<void>
}
