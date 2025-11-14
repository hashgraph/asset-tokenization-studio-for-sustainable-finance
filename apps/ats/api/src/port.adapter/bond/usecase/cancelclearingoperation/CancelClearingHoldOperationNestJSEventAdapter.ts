// SPDX-License-Identifier: Apache-2.0

import { ConverterUtils, type CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { ClearingOperationCanceledDLTEvent } from "@port/bond/usecase/cancelclearingoperation/model/ClearingOperationCanceledDLTEvent"
import { CancelClearingHoldCommand } from "@app/bond/cancelclearinghold/command/CancelClearingHoldCommand"
import { CancelClearingHoldOperationPort } from "./CancelClearingHoldOperationPort"

@Singleton()
export class CancelClearingHoldOperationNestJSEventAdapter
  implements CancelClearingHoldOperationPort, EventListener<ClearingOperationCanceledDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(ClearingOperationCanceledDLTEvent)
  async handle(event: ClearingOperationCanceledDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new CancelClearingHoldCommand(
        event.clearingId,
        await ConverterUtils.getHederaAddressFromEvm(event.contractId),
        await ConverterUtils.getHederaAddressFromEvm(event.tokenHolder),
        event.partition,
        await ConverterUtils.getHederaAddressFromEvm(event.operator),
      ),
    )
  }
}
