// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from '@hashgraph/green-bonds-shared-core'
import type { BondRepository } from '../repositories/BondRepository'
import { BondNotFoundError } from '../errors/BondNotFoundError'
import { Bond } from '../model/Bond'

@Singleton()
export class CheckBondExistsDomainService {
  constructor(@Inject() private readonly bondRepository: BondRepository) {}

  async execute(bondContractId: string): Promise<Bond> {
    const bond = await this.bondRepository.findByContractId(bondContractId)
    if (!bond) {
      throw BondNotFoundError.contractIdError(bondContractId)
    }
    return bond
  }
}
