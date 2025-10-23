// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { PaymentToken } from "@domain/paymenttoken/model/PaymentToken"
import type { PaymentTokenRepository } from "@domain/paymenttoken/repositories/PaymentTokenRepository"
import { PaymentTokenNotFoundError } from "@domain/paymenttoken/errors/PaymentTokenNotFoundError"

@Singleton()
export class CheckPaymentTokenExistsDomainService {
  constructor(@Inject() private readonly paymentTokenRepository: PaymentTokenRepository) {}

  async executeByTreasuryContractId(paymentTokenContractId: string, treasuryContractId: string): Promise<PaymentToken> {
    const paymentToken = await this.paymentTokenRepository.findByContractIdAndTreasuryContractId(
      paymentTokenContractId,
      treasuryContractId,
    )
    if (!paymentToken) {
      throw PaymentTokenNotFoundError.contractIdError(paymentTokenContractId)
    }
    return paymentToken
  }
}
