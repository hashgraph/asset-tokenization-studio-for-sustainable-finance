// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { BondLockRepository } from "../repository/BondLockRepository"
import { DeleteBondLockDomainServiceRequest } from "./model/DeleteBondLockDomainServiceRequest"
import { BondLockNotFoundError } from "../errors/BondLockNotFoundError"

@Singleton()
export class DeleteBondLockDomainService {
  constructor(@Inject() private readonly bondLockRepository: BondLockRepository) {}

  async execute(request: DeleteBondLockDomainServiceRequest): Promise<void> {
    const existingLock = await this.bondLockRepository.findByBondContractIdAndId(request.bondContractId, request.lockId)

    if (!existingLock) {
      throw BondLockNotFoundError.lockIdError(request.bondContractId, request.lockId)
    }

    await this.bondLockRepository.delete(existingLock.bondContractId, existingLock.id)
  }
}
