// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { ConverterUtils, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { UpdatePaymentTokenCommand } from "@app/treasury/updatepaymenttoken/command/UpdatePaymentTokenCommand"
import { PaymentTokenUpdatedDLTEvent } from "@port/treasury/usecase/updatepaymenttoken/model/PaymentTokenUpdatedDLTEvent"
import { UpdatePaymentTokenPort } from "./UpdatePaymentTokenPort"

@Singleton()
export class UpdatePaymentTokenNestJSEventAdapter
  implements UpdatePaymentTokenPort, EventListener<PaymentTokenUpdatedDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(PaymentTokenUpdatedDLTEvent)
  async handle(event: PaymentTokenUpdatedDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new UpdatePaymentTokenCommand(
        event.contractId,
        await ConverterUtils.getHederaAddressFromEvm(event.newPaymentToken),
        +event.dissociationError,
      ),
    )
  }
}
