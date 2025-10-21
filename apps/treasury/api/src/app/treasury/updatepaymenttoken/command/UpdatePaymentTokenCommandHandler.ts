// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { UpdatePaymentTokenCommand } from "./UpdatePaymentTokenCommand"
import { PaymentTokenUpdatedEvent } from "@domain/treasury/event/PaymentTokenUpdatedEvent"
import { UpdatePaymentTokenDomainService } from "@domain/treasury/services/UpdatePaymentTokenDomainService"

@Singleton()
@Handler(UpdatePaymentTokenCommand)
export class UpdatePaymentTokenCommandHandler implements CommandHandler<UpdatePaymentTokenCommand, void> {
  constructor(
    @Inject() private readonly eventBus: EventBus,
    private readonly updatePaymentTokenDomainService: UpdatePaymentTokenDomainService,
  ) {}

  @Validate()
  async execute(command: UpdatePaymentTokenCommand): Promise<void> {
    const result = await this.updatePaymentTokenDomainService.execute(
      command.treasuryContractId,
      command.paymentTokenContractId,
    )

    this.eventBus.publish(
      new PaymentTokenUpdatedEvent(
        result.treasury.contractId,
        result.treasury.bondContractId,
        command.paymentTokenContractId,
      ),
    )
  }
}
