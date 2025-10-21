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
    if (request.amount !== undefined) {
      // Check if treasury with this payment token exists and toAccountId is the treasury
      const treasuryTo = await this.treasuryRepository.findByContractId(request.toAccountId)
      if (treasuryTo && treasuryTo.paymentToken?.contractId === request.paymentTokenContractId) {
        await this.commandBus.execute(
          new AddPaymentTokenTransferCommand(
            request.fromAccountId,
            treasuryTo.paymentToken.id,
            request.amount,
            <string>TransferType.INFLOW,
          ),
        )
      }
    }
  }
}
