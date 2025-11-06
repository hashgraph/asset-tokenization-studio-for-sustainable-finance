// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { PaymentTokenRepository } from "@domain/paymenttoken/repositories/PaymentTokenRepository"
import type { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"
import { PaymentToken } from "@domain/paymenttoken/model/PaymentToken"
import { AddPaymentTokenDomainServiceResponse } from "@domain/paymenttoken/services/model/AddPaymentTokenDomainServiceResponse"

@Singleton()
export class AddPaymentTokenDomainService {
  constructor(
    @Inject() private readonly paymentTokenRepository: PaymentTokenRepository,
    @Inject() private readonly treasuryRepository: TreasuryRepository,
    private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService,
  ) {}

  async execute(
    treasuryContractId: string,
    paymentTokenContractId: string,
    decimals: number,
  ): Promise<AddPaymentTokenDomainServiceResponse> {
    const treasury = await this.checkTreasuryExistsDomainService.execute(treasuryContractId)

    const paymentToken = new PaymentToken()
    paymentToken.contractId = paymentTokenContractId
    paymentToken.treasuryId = treasury.id
    paymentToken.decimals = decimals

    // Associate payment token to treasury
    treasury.paymentToken = paymentToken

    // Save treasury (cascade will save the payment token)
    await this.treasuryRepository.save(treasury)

    return new AddPaymentTokenDomainServiceResponse(paymentToken, treasury)
  }
}
