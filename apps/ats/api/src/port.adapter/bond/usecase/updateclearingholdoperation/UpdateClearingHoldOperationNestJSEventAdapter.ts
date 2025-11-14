// SPDX-License-Identifier: Apache-2.0
import { ConverterUtils, EventListener, Handler, Singleton, Inject, type CommandBus } from "@hashgraph/green-bonds-shared-core"
import { ClearingOperationApprovedDLTEvent } from "@port/bond/usecase/updateclearingholdoperation/model/ClearingOperationApprovedDLTEvent"
import { ClearingOperationReclaimedDLTEvent } from "@port/bond/usecase/updateclearingholdoperation/model/ClearingOperationReclaimedDLTEvent"
import { UpdateClearingHoldStatusDomainService } from "@domain/bond/clearinghold/service/UpdateClearingHoldStatusDomainService"
import { UpdateClearingHoldStatusDomainServiceRequest } from "@domain/bond/clearinghold/service/model/UpdateClearingHoldStatusDomainServiceRequest"
import { ClearingStatus } from "@domain/bond/clearinghold/model/ClearingHold"
import { ClearingApprovedEvent } from "@domain/bond/clearinghold/event/ClearingApprovedEvent"
import { ClearingBalanceChangedEvent } from "@domain/bond/clearinghold/event/ClearingBalanceChangedEvent"
import { ReclaimClearingHoldCommand } from "@app/bond/reclaimclearinghold/command/ReclaimClearingHoldCommand"

@Singleton()
export class ClearingOperationApprovedNestJSEventAdapter implements EventListener<ClearingOperationApprovedDLTEvent> {
  constructor(
    private readonly updateClearingStatusDomainService: UpdateClearingHoldStatusDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Handler(ClearingOperationApprovedDLTEvent)
  async handle(event: ClearingOperationApprovedDLTEvent): Promise<void> {
    const request = new UpdateClearingHoldStatusDomainServiceRequest()
    request.bondContractId = await ConverterUtils.getHederaAddressFromEvm(event.contractId)
    request.holderAccountId = await ConverterUtils.getHederaAddressFromEvm(event.tokenHolder)
    request.clearingId = event.clearingId
    request.newStatus = ClearingStatus.APPROVED

    const updatedClearing = await this.updateClearingStatusDomainService.execute(request)

    this.eventBus.publish(new ClearingApprovedEvent(updatedClearing))
    this.eventBus.publish(
      new ClearingBalanceChangedEvent(
        updatedClearing.bondContractId,
        updatedClearing.holderAccountId,
        updatedClearing.partition,
        updatedClearing.amount,
        "CLEARING_EXECUTE",
      ),
    )
  }
}

@Singleton()
export class ClearingOperationReclaimedNestJSEventAdapter implements EventListener<ClearingOperationReclaimedDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(ClearingOperationReclaimedDLTEvent)
  async handle(event: ClearingOperationReclaimedDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new ReclaimClearingHoldCommand(
        event.clearingId,
        await ConverterUtils.getHederaAddressFromEvm(event.contractId),
        await ConverterUtils.getHederaAddressFromEvm(event.tokenHolder),
        event.partition,
        await ConverterUtils.getHederaAddressFromEvm(event.operator),
      ),
    )
  }
}
