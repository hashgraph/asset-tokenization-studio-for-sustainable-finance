import { Inject, Singleton } from '@hashgraph/green-bonds-shared-core'
import type { BondRepository } from '../repositories/BondRepository'
import { Bond } from '../model/Bond'
import { BondFoundError } from '../errors/BondFoundError'
import { CreateBondDomainServiceRequest } from './model/CreateBondDomainServiceRequest'

@Singleton()
export class CreateBondDomainService {
  constructor(@Inject() private readonly bondRepository: BondRepository) {}

  async execute(createBondDomainServiceRequest: CreateBondDomainServiceRequest): Promise<Bond> {
    const existingBond = await this.bondRepository.findByContractId(createBondDomainServiceRequest.contractId)

    if (existingBond) {
      throw BondFoundError.contractIdError(createBondDomainServiceRequest.contractId)
    }

    const bond = Object.assign(new Bond(), {
      contractId: createBondDomainServiceRequest.contractId,
      name: createBondDomainServiceRequest.name,
      symbol: createBondDomainServiceRequest.symbol,
      isin: createBondDomainServiceRequest.isin,
      decimals: createBondDomainServiceRequest.decimals,
      currency: createBondDomainServiceRequest.currency,
      nominalValue: createBondDomainServiceRequest.nominalValue,
      startingDate: createBondDomainServiceRequest.startingDate,
      maturityDate: createBondDomainServiceRequest.maturityDate,
      maxSupply: createBondDomainServiceRequest.maxSupply,
    })
    return await this.bondRepository.save(bond)
  }
}
