// SPDX-License-Identifier: Apache-2.0
import {
  ConverterUtils,
  EventListener,
  Handler,
  Singleton,
  Inject,
  type CommandBus,
} from "@hashgraph/green-bonds-shared-core"
import { ClearingOperationApprovedDLTEvent } from "@port/bond/usecase/updateclearingoperation/model/ClearingOperationApprovedDLTEvent"
import { ClearingOperationReclaimedDLTEvent } from "@port/bond/usecase/updateclearingoperation/model/ClearingOperationReclaimedDLTEvent"
import { ReclaimClearingCommand } from "@app/bond/reclaimclearing/command/ReclaimClearingCommand"
import { ApproveClearingCommand } from "@app/bond/approveclearing/command/ApproveClearingCommand"
import { UpdateClearingOperationPort } from "@port/bond/usecase/updateclearingoperation/UpdateClearingOperationPort"

@Singleton()
export class ClearingOperationApprovedNestJSEventAdapter
  implements UpdateClearingOperationPort, EventListener<ClearingOperationApprovedDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(ClearingOperationApprovedDLTEvent)
  async handle(event: ClearingOperationApprovedDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new ApproveClearingCommand(
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

@Singleton()
export class ClearingOperationReclaimedNestJSEventAdapter
  implements UpdateClearingOperationPort, EventListener<ClearingOperationReclaimedDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(ClearingOperationReclaimedDLTEvent)
  async handle(event: ClearingOperationReclaimedDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new ReclaimClearingCommand(
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
