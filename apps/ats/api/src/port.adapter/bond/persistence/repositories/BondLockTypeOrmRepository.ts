import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BondLockRepository } from "@domain/bond/lock/repository/BondLockRepository"
import { BondLock } from "@domain/bond/lock/model/BondLock"
import { BondLockPersistence } from "../model/BondLockPersistence"

@Injectable()
export class BondLockTypeOrmRepository implements BondLockRepository {
  constructor(
    @InjectRepository(BondLockPersistence)
    private readonly repository: Repository<BondLockPersistence>,
  ) {}

  async save(bondLock: BondLock): Promise<BondLock> {
    return (await this.repository.save(bondLock as unknown as BondLockPersistence)) as BondLock
  }

  async findByBondContractIdAndId(bondContractId: string, id: number): Promise<BondLock | null> {
    return (await this.repository.findOne({
      where: { contractId: bondContractId, id },
    })) as BondLock | null
  }
}
