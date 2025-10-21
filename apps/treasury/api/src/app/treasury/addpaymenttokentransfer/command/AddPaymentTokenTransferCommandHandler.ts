// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { AddPaymentTokenTransferCommand } from "./AddPaymentTokenTransferCommand"
import { PaymentTokenTransferAddedEvent } from "@domain/treasury/event/PaymentTokenTransferAddedEvent"
import { AddPaymentTokenTransferDomainService } from "@domain/treasury/services/AddPaymentTokenTransferDomainService"

@Singleton()
@Handler(AddPaymentTokenTransferCommand)
export class AddPaymentTokenTransferCommandHandler implements CommandHandler<AddPaymentTokenTransferCommand, void> {
  constructor(
    @Inject() private readonly eventBus: EventBus,
    private readonly addPaymentTokenTransferDomainService: AddPaymentTokenTransferDomainService,
  ) {}

  @Validate()
  async execute(command: AddPaymentTokenTransferCommand): Promise<void> {
    const result = await this.addPaymentTokenTransferDomainService.execute(
      command.treasuryContractId,
      command.recipientAccountId,
      command.amount,
    )

    this.eventBus.publish(
      new PaymentTokenTransferAddedEvent(
        command.treasuryContractId,
        command.recipientAccountId,
        result.transfer.amount,
        result.transfer.id,
      ),
    )
  }
}
