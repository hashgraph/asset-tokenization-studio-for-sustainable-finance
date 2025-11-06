// SPDX-License-Identifier: Apache-2.0

import type { EventBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { UpdatePaymentTokenDissociationErrorCommand } from "@app/paymenttoken/updatepaymenttokendissociationerror/command/UpdatePaymentTokenDissociationErrorCommand"
import type { PaymentTokenRepository } from "@domain/paymenttoken/repositories/PaymentTokenRepository"
import { PaymentTokenDissociationErrorUpdatedEvent } from "@domain/paymenttoken/event/PaymentTokenDissociationErrorUpdatedEvent"

@Singleton()
@Handler(UpdatePaymentTokenDissociationErrorCommand)
export class UpdatePaymentTokenDissociationErrorCommandHandler
  implements CommandHandler<UpdatePaymentTokenDissociationErrorCommand, void>
{
  constructor(
    @Inject() private readonly paymentTokenRepository: PaymentTokenRepository,
    @Inject() private readonly eventBus: EventBus,
    @Inject() private readonly transactionManager: TransactionManager,
  ) {}

  @Validate()
  async execute(command: UpdatePaymentTokenDissociationErrorCommand): Promise<void> {
    await this.transactionManager.execute(async () => {
      const tokens = await this.paymentTokenRepository.findAllRemovedByContractIdAndTreasuryContractId(
        command.paymentTokenContractId,
        command.treasuryContractId,
      )
      for (const token of tokens) {
        token.clearDissociationError()
        await this.paymentTokenRepository.save(token)
      }
    })
    this.eventBus.publish(
      new PaymentTokenDissociationErrorUpdatedEvent(command.treasuryContractId, command.paymentTokenContractId),
    )
  }
}
