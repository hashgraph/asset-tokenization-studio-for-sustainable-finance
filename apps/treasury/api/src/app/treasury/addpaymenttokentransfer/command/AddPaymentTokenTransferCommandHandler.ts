// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { AddPaymentTokenTransferCommand } from "./AddPaymentTokenTransferCommand"
import { PaymentTokenTransferAddedEvent } from "@domain/treasury/event/PaymentTokenTransferAddedEvent"
import type { PaymentTokenTransferRepository } from "@domain/paymenttoken/repositories/PaymentTokenTransferRepository"
import { PaymentTokenTransfer } from "@domain/paymenttoken/model/PaymentTokenTransfer"
import { TransferType } from "@domain/shared/model/TransferType"

@Singleton()
@Handler(AddPaymentTokenTransferCommand)
export class AddPaymentTokenTransferCommandHandler implements CommandHandler<AddPaymentTokenTransferCommand, void> {
  constructor(
    @Inject() private readonly paymentTokenTransferRepository: PaymentTokenTransferRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: AddPaymentTokenTransferCommand): Promise<void> {
    await this.paymentTokenTransferRepository.save({
      accountId: command.accountId,
      paymentTokenId: command.paymentTokenId,
      amount: command.amount,
      type: <TransferType>command.type,
    } as PaymentTokenTransfer)

    this.eventBus.publish(
      new PaymentTokenTransferAddedEvent(command.paymentTokenId, command.accountId, command.amount, command.type),
    )
  }
}
