// SPDX-License-Identifier: Apache-2.0

import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { UpdatePaymentTokenDissociationErrorCommand } from "@app/paymenttoken/updatepaymenttokendissociationerror/command/UpdatePaymentTokenDissociationErrorCommand"
import type { PaymentTokenRepository } from "@domain/paymenttoken/repositories/PaymentTokenRepository"
import { CheckPaymentTokenExistsDomainService } from "@domain/paymenttoken/services/CheckPaymentTokenExistsDomainService"
import { PaymentTokenDissociationErrorUpdatedEvent } from "@domain/paymenttoken/event/PaymentTokenDissociationErrorUpdatedEvent"

@Singleton()
@Handler(UpdatePaymentTokenDissociationErrorCommand)
export class UpdatePaymentTokenDissociationErrorCommandHandler
  implements CommandHandler<UpdatePaymentTokenDissociationErrorCommand, void>
{
  constructor(
    private readonly checkPaymentTokenExistsDomainService: CheckPaymentTokenExistsDomainService,
    @Inject() private readonly paymentTokenRepository: PaymentTokenRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: UpdatePaymentTokenDissociationErrorCommand): Promise<void> {
    const paymentToken = await this.checkPaymentTokenExistsDomainService.executeByTreasuryContractId(
      command.paymentTokenContractId,
      command.treasuryContractId,
    )
    paymentToken.clearDissociationError()

    await this.paymentTokenRepository.save(paymentToken)
    this.eventBus.publish(new PaymentTokenDissociationErrorUpdatedEvent(paymentToken.treasuryId, paymentToken.id))
  }
}
