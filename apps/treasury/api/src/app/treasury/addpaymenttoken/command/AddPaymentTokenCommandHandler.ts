// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { AddPaymentTokenCommand } from "@app/treasury/addpaymenttoken/command/AddPaymentTokenCommand"
import { PaymentTokenAddedEvent } from "@domain/paymenttoken/event/PaymentTokenAddedEvent"
import { AddPaymentTokenDomainService } from "@domain/paymenttoken/services/AddPaymentTokenDomainService"
import type { HederaPort } from "@port/blockchain/HederaPort"

@Singleton()
@Handler(AddPaymentTokenCommand)
export class AddPaymentTokenCommandHandler implements CommandHandler<AddPaymentTokenCommand, void> {
  constructor(
    @Inject() private readonly eventBus: EventBus,
    @Inject() private readonly hederaPort: HederaPort,
    private readonly addPaymentTokenDomainService: AddPaymentTokenDomainService,
  ) {}

  @Validate()
  async execute(command: AddPaymentTokenCommand): Promise<void> {
    const decimals = await this.hederaPort.getTokenDecimals(command.paymentTokenContractId)

    const result = await this.addPaymentTokenDomainService.execute(
      command.treasuryContractId,
      command.paymentTokenContractId,
      decimals,
    )

    this.eventBus.publish(
      new PaymentTokenAddedEvent(
        result.treasury.contractId,
        result.treasury.bondContractId,
        command.paymentTokenContractId,
      ),
    )
  }
}
