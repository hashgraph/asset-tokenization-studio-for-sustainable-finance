// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { TransactionManager } from "@hashgraph/green-bonds-shared-core"
import type { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import type { PaymentTokenRepository } from "@domain/paymenttoken/repositories/PaymentTokenRepository"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"
import { PaymentToken } from "@domain/paymenttoken/model/PaymentToken"
import { UpdatePaymentTokenDomainServiceResponse } from "@domain/treasury/services/model/UpdatePaymentTokenDomainServiceResponse"

@Singleton()
export class UpdatePaymentTokenDomainService {
  constructor(
    @Inject() private readonly treasuryRepository: TreasuryRepository,
    @Inject() private readonly paymentTokenRepository: PaymentTokenRepository,
    @Inject() private readonly transactionManager: TransactionManager,
  ) {}

  async execute(
    treasuryContractId: string,
    newPaymentTokenContractId: string,
    decimals: number,
    dissociationError: number,
  ): Promise<UpdatePaymentTokenDomainServiceResponse> {
    return await this.transactionManager.execute(async (transactionId) => {
      const treasury = await this.treasuryRepository.findByContractId(treasuryContractId)
      if (!treasury) {
        throw TreasuryNotFoundError.contractIdsError([treasuryContractId])
      }

      // Mark old payment token with removal date if exists
      if (treasury.paymentToken) {
        treasury.paymentToken.removalDate = new Date()
        treasury.paymentToken.dissociationError = dissociationError || undefined
        await this.paymentTokenRepository.save(treasury.paymentToken, transactionId)
      }

      // Create new payment token
      const newPaymentToken = new PaymentToken()
      newPaymentToken.contractId = newPaymentTokenContractId
      newPaymentToken.treasuryId = treasury.id
      newPaymentToken.decimals = decimals
      treasury.paymentToken = newPaymentToken

      // Update treasury with new payment token (cascade will save the new payment token)
      await this.treasuryRepository.save(treasury, transactionId)

      return new UpdatePaymentTokenDomainServiceResponse(treasury)
    })
  }
}
