// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import type { PaymentTokenTransferRepository } from "@domain/paymenttoken/repositories/PaymentTokenTransferRepository"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"
import { PaymentTokenNotConfiguredError } from "@domain/treasury/errors/PaymentTokenNotConfiguredError"
import { PaymentTokenTransfer } from "@domain/paymenttoken/model/PaymentTokenTransfer"
import { TransferType } from "@domain/shared/model/TransferType"
import { AddPaymentTokenTransferDomainServiceResponse } from "./model/AddPaymentTokenTransferDomainServiceResponse"

@Singleton()
export class AddPaymentTokenTransferDomainService {
  constructor(
    @Inject() private readonly treasuryRepository: TreasuryRepository,
    @Inject() private readonly paymentTokenTransferRepository: PaymentTokenTransferRepository,
  ) {}

  async execute(
    treasuryContractId: string,
    recipientAccountId: string,
    amount: bigint,
  ): Promise<AddPaymentTokenTransferDomainServiceResponse> {
    const treasury = await this.treasuryRepository.findByContractId(treasuryContractId)
    if (!treasury) {
      throw TreasuryNotFoundError.contractIdsError([treasuryContractId])
    }

    if (!treasury.paymentToken) {
      throw PaymentTokenNotConfiguredError.forTreasury(treasuryContractId)
    }

    const transfer = new PaymentTokenTransfer()
    transfer.accountId = recipientAccountId
    transfer.amount = amount.toString()
    transfer.paymentTokenId = treasury.paymentToken.id
    transfer.type = TransferType.OUTFLOW

    const savedTransfer = await this.paymentTokenTransferRepository.save(transfer)

    return new AddPaymentTokenTransferDomainServiceResponse(savedTransfer)
  }
}
