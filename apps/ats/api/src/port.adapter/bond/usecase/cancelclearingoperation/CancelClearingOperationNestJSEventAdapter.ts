// SPDX-License-Identifier: Apache-2.0

import { ConverterUtils, type CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { ClearingOperationCanceledDLTEvent } from "@port/bond/usecase/cancelclearingoperation/model/ClearingOperationCanceledDLTEvent"
import { CancelClearingOperationPort } from "./CancelClearingOperationPort"
import { CancelClearingCommand } from "@app/bond/cancelclearing/command/CancelClearingCommand"

@Singleton()
export class CancelClearingOperationNestJSEventAdapter
  implements CancelClearingOperationPort, EventListener<ClearingOperationCanceledDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(ClearingOperationCanceledDLTEvent)
  async handle(event: ClearingOperationCanceledDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new CancelClearingCommand(
        event.clearingId,
        await ConverterUtils.getHederaAddressFromEvm(event.contractId),
        await ConverterUtils.getHederaAddressFromEvm(event.tokenHolder),
        event.partition,
        await ConverterUtils.getHederaAddressFromEvm(event.operator),
        event.clearingOperationType,
      ),
    )
  }
}
