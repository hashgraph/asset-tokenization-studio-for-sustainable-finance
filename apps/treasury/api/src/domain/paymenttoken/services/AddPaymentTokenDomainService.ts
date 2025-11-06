// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { PaymentTokenRepository } from "@domain/paymenttoken/repositories/PaymentTokenRepository"
import type { HederaPort } from "@port/blockchain/HederaPort"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"
import { PaymentToken } from "@domain/paymenttoken/model/PaymentToken"
import { AddPaymentTokenDomainServiceResponse } from "@domain/paymenttoken/services/model/AddPaymentTokenDomainServiceResponse"

@Singleton()
export class AddPaymentTokenDomainService {
  constructor(
    @Inject() private readonly paymentTokenRepository: PaymentTokenRepository,
    @Inject() private readonly hederaPort: HederaPort,
    private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService,
  ) {}

  async execute(
    treasuryContractId: string,
    paymentTokenContractId: string,
  ): Promise<AddPaymentTokenDomainServiceResponse> {
    const treasury = await this.checkTreasuryExistsDomainService.execute(treasuryContractId)

    const decimals = await this.hederaPort.getTokenDecimals(paymentTokenContractId)

    const paymentToken = new PaymentToken()
    paymentToken.contractId = paymentTokenContractId
    paymentToken.treasuryId = treasury.id
    paymentToken.decimals = decimals

    await this.paymentTokenRepository.save(paymentToken)

    return new AddPaymentTokenDomainServiceResponse(paymentToken, treasury)
  }
}
