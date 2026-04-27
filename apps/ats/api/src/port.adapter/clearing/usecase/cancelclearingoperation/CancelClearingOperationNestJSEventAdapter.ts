// SPDX-License-Identifier: Apache-2.0

import { ConverterUtils, type CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { ClearingOperationCanceledDLTEvent } from "@port/clearing/usecase/cancelclearingoperation/model/ClearingOperationCanceledDLTEvent"
import { CancelClearingOperationPort } from "./CancelClearingOperationPort"
import { CancelClearingCommand } from "@app/clearing/cancelclearing/command/CancelClearingCommand"
import { ClearingOperationType } from "@domain/clearing/model/ClearingOperationType"

@Singleton()
export class CancelClearingOperationNestJSEventAdapter
  implements CancelClearingOperationPort, EventListener<ClearingOperationCanceledDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(ClearingOperationCanceledDLTEvent)
  async handle(event: ClearingOperationCanceledDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new CancelClearingCommand(
        Number(event.clearingId),
        event.contractId,
        await ConverterUtils.getHederaAddressFromEvm(event.tokenHolder),
        event.partition,
        await ConverterUtils.getHederaAddressFromEvm(event.operator),
        Number(event.clearingOperationType) as ClearingOperationType,
      ),
    )
  }
}
