import { Bond } from '../model/Bond'

export interface BondRepository {
  save(bond: Bond): Promise<Bond>
  findById(id: string): Promise<Bond | null>
  findByContractId(contractId: string): Promise<Bond | null>
  findAll(): Promise<Bond[]>
}
