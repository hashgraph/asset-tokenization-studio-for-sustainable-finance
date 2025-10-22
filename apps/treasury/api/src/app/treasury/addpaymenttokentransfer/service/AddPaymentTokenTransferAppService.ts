// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { AddPaymentTokenTransferAppServiceRequest } from "@app/treasury/addpaymenttokentransfer/service/model/AddPaymentTokenTransferAppServiceRequest"
import type { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import { TransferType } from "@domain/shared/model/TransferType"
import { AddPaymentTokenTransferCommand } from "@app/treasury/addpaymenttokentransfer/command/AddPaymentTokenTransferCommand"

@Singleton()
export class AddPaymentTokenTransferAppService {
  constructor(
    @Inject() private readonly treasuryRepository: TreasuryRepository,
    @Inject() private readonly commandBus: CommandBus,
  ) {}

  @Validate()
  async execute(request: AddPaymentTokenTransferAppServiceRequest): Promise<void> {
    // Check if this transfer is related to an existing treasury with this payment token
    let transferAccountId
    let transferType
    let treasury
    if (request.amount !== undefined) {
      // Check if fromAccountId is the treasury (OUTFLOW)
      const treasuryFrom = await this.treasuryRepository.findByContractId(request.fromAccountId)
      if (treasuryFrom && treasuryFrom.paymentToken?.contractId === request.paymentTokenContractId) {
        transferAccountId = request.toAccountId
        transferType = <string>TransferType.OUTFLOW
        treasury = treasuryFrom
      } else {
        // Check if toAccountId is the treasury (INFLOW)
        const treasuryTo = await this.treasuryRepository.findByContractId(request.toAccountId)
        if (treasuryTo && treasuryTo.paymentToken?.contractId === request.paymentTokenContractId) {
          transferAccountId = request.fromAccountId
          transferType = <string>TransferType.INFLOW
          treasury = treasuryTo
        }
      }

      if (transferAccountId && transferType && treasury) {
        await this.commandBus.execute(
          new AddPaymentTokenTransferCommand(
            transferAccountId,
            treasury.paymentToken!.id,
            request.amount,
            transferType,
          ),
        )
      }
    }
  }
}
