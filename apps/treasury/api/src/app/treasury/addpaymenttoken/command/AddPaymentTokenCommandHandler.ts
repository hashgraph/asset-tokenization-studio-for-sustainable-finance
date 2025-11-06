// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { AddPaymentTokenCommand } from "@app/treasury/addpaymenttoken/command/AddPaymentTokenCommand"
import { PaymentTokenAddedEvent } from "@domain/paymenttoken/event/PaymentTokenAddedEvent"
import { AddPaymentTokenDomainService } from "@domain/paymenttoken/services/AddPaymentTokenDomainService"

@Singleton()
@Handler(AddPaymentTokenCommand)
export class AddPaymentTokenCommandHandler implements CommandHandler<AddPaymentTokenCommand, void> {
  constructor(
    @Inject() private readonly eventBus: EventBus,
    private readonly addPaymentTokenDomainService: AddPaymentTokenDomainService,
  ) {}

  @Validate()
  async execute(command: AddPaymentTokenCommand): Promise<void> {
    const result = await this.addPaymentTokenDomainService.execute(
      command.treasuryContractId,
      command.paymentTokenContractId,
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
