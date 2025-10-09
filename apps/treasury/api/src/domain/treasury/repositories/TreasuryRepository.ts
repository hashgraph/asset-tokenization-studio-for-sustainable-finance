import { Treasury } from "@domain/treasury/model/Treasury"

export interface TreasuryRepository {
  save(treasury: Treasury): Promise<Treasury>

  findByContractId(contractId: string): Promise<Treasury | null>

  findByBondContractId(bondContractId: string): Promise<Treasury | null>
}
