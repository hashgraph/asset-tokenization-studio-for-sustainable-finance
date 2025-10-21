// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { ConverterUtils, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { AddPaymentTokenTransferCommand } from "@app/treasury/addpaymenttokentransfer/command/AddPaymentTokenTransferCommand"
import { PaymentTokenTransferredDLTEvent } from "@port/treasury/usecase/addpaymenttokentransfer/model/PaymentTokenTransferredDLTEvent"
import { AddPaymentTokenTransferPort } from "./AddPaymentTokenTransferPort"

@Singleton()
export class AddPaymentTokenTransferNestJSEventAdapter
  implements AddPaymentTokenTransferPort, EventListener<PaymentTokenTransferredDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(PaymentTokenTransferredDLTEvent)
  async handle(event: PaymentTokenTransferredDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new AddPaymentTokenTransferCommand(
        event.contractId,
        await ConverterUtils.getHederaAddressFromEvm(event.to),
        event.amount,
      ),
    )
  }
}
