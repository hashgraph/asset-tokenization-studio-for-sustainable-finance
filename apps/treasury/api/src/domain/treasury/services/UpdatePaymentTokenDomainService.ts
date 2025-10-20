// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import type { PaymentTokenRepository } from "@domain/paymenttoken/repositories/PaymentTokenRepository"
import type { TransactionManager } from "@domain/shared/transaction/TransactionManager"
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
  ): Promise<UpdatePaymentTokenDomainServiceResponse> {
    return await this.transactionManager.execute(async () => {
      const treasury = await this.treasuryRepository.findByContractId(treasuryContractId)
      if (!treasury) {
        throw TreasuryNotFoundError.contractIdsError([treasuryContractId])
      }

      // Mark old payment token with removal date if exists
      if (treasury.paymentToken) {
        treasury.paymentToken.removalDate = new Date()
        await this.paymentTokenRepository.save(treasury.paymentToken)
      }

      // Create new payment token
      const newPaymentToken = new PaymentToken()
      newPaymentToken.contractId = newPaymentTokenContractId
      newPaymentToken.treasuryId = treasury.id
      treasury.paymentToken = newPaymentToken

      // Update treasury with new payment token (cascade will save the new payment token)
      await this.treasuryRepository.save(treasury)

      return new UpdatePaymentTokenDomainServiceResponse(treasury)
    })
  }
}
