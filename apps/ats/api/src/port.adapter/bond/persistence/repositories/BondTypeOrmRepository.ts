import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BondRepository } from '@domain/bond/repositories/BondRepository'
import { Bond } from '@domain/bond/model/Bond'
import { BondPersistence } from '../model/BondPersistence'

@Injectable()
export class BondTypeOrmRepository implements BondRepository {
  constructor(
    @InjectRepository(BondPersistence)
    private readonly bondRepository: Repository<BondPersistence>,
  ) {}

  async save(bond: Bond): Promise<Bond> {
    return (await this.bondRepository.save(bond as BondPersistence)) as Bond
  }

  async findById(id: string): Promise<Bond | null> {
    return (await this.bondRepository.findOne({ where: { id } })) as Bond | null
  }

  async findByContractId(contractId: string): Promise<Bond | null> {
    return (await this.bondRepository.findOne({ where: { contractId } })) as Bond | null
  }

  async findAll(): Promise<Bond[]> {
    return (await this.bondRepository.find()) as Bond[]
  }
}
