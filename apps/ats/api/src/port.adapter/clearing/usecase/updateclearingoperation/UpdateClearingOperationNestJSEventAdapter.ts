// SPDX-License-Identifier: Apache-2.0
import {
  ConverterUtils,
  EventListener,
  Handler,
  Singleton,
  Inject,
  type CommandBus,
} from "@hashgraph/green-bonds-shared-core"
import { ClearingOperationApprovedDLTEvent } from "@port/clearing/usecase/updateclearingoperation/model/ClearingOperationApprovedDLTEvent"
import { ClearingOperationReclaimedDLTEvent } from "@port/clearing/usecase/updateclearingoperation/model/ClearingOperationReclaimedDLTEvent"
import { ReclaimClearingCommand } from "@app/clearing/reclaimclearing/command/ReclaimClearingCommand"
import { ApproveClearingCommand } from "@app/clearing/approveclearing/command/ApproveClearingCommand"
import { UpdateClearingOperationPort } from "@port/clearing/usecase/updateclearingoperation/UpdateClearingOperationPort"
import { ClearingOperationType } from "@domain/clearing/model/ClearingOperationType"
import { AbiCoder } from "ethers"

@Singleton()
export class ClearingOperationApprovedNestJSEventAdapter
  implements UpdateClearingOperationPort, EventListener<ClearingOperationApprovedDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(ClearingOperationApprovedDLTEvent)
  async handle(event: ClearingOperationApprovedDLTEvent): Promise<void> {
    const clearingOperationType = Number(event.clearingOperationType) as ClearingOperationType
    let holdId: number | undefined
    if (clearingOperationType === ClearingOperationType.HOLD && event.operationData && event.operationData !== "0x") {
      const decodedData = AbiCoder.defaultAbiCoder().decode(["uint256"], event.operationData)
      holdId = Number(decodedData[0])
    }

    await this.commandBus.execute(
      new ApproveClearingCommand(
        Number(event.clearingId),
        event.contractId,
        await ConverterUtils.getHederaAddressFromEvm(event.tokenHolder),
        event.partition,
        await ConverterUtils.getHederaAddressFromEvm(event.operator),
        clearingOperationType,
        holdId,
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
