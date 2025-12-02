import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { BondLockRepository } from "../repository/BondLockRepository"
import { BondLock } from "../model/BondLock"
import { BondLockFoundError } from "../errors/BondLockFoundError"
import { CreateBondLockDomainServiceRequest } from "./model/CreateBondLockDomainServiceRequest"

@Singleton()
export class CreateBondLockDomainService {
  constructor(@Inject() private readonly bondLockRepository: BondLockRepository) {}

  async execute(request: CreateBondLockDomainServiceRequest, transactionId?: string): Promise<BondLock> {
    const now = new Date()

    const existingLock = await this.bondLockRepository.findByBondContractIdAndId(request.bondContractId, request.lockId)

    if (existingLock) {
      throw BondLockFoundError.lockIdError(request.bondContractId, request.lockId)
    }

    const bondLock = Object.assign(new BondLock(), {
      id: request.lockId,
      contractId: request.bondContractId,
      holderAccountId: request.holderAccountId,
      partition: request.partition,
      amount: request.amount,
      expirationTimestamp: request.expirationTimestamp,
      operatorAccountId: request.operatorAccountId,
      createdAt: now,
      updatedAt: now,
    })

    return await this.bondLockRepository.save(bondLock, transactionId)
  }
}
