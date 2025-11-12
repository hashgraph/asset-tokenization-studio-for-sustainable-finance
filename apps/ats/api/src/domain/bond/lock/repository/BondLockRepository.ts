import { BondLock } from "../model/BondLock"

export interface BondLockRepository {
  save(bondLock: BondLock): Promise<BondLock>
  findByBondContractIdAndId(bondContractId: string, id: number): Promise<BondLock | null>
}
