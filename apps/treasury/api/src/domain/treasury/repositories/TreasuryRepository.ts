import { Treasury } from "@domain/treasury/model/Treasury"

export interface TreasuryRepository {
  save(treasury: Treasury): Promise<Treasury>

  findByContractAddress(contractAddress: string): Promise<Treasury>
}
