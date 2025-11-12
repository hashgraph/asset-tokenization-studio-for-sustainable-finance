// SPDX-License-Identifier: Apache-2.0
import { ConverterUtils, EventListener, Handler, Singleton, Inject } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { ClearingOperationApprovedDLTEvent } from "@port/bond/usecase/updateclearingoperation/model/ClearingOperationApprovedDLTEvent"
import { ClearingOperationReclaimedDLTEvent } from "@port/bond/usecase/updateclearingoperation/model/ClearingOperationReclaimedDLTEvent"
import { UpdateClearingHoldStatusDomainService } from "@domain/bond/clearinghold/service/UpdateClearingHoldStatusDomainService"
import { UpdateClearingHoldStatusDomainServiceRequest } from "@domain/bond/clearinghold/service/model/UpdateClearingHoldStatusDomainServiceRequest"
import { DeleteClearingHoldDomainService } from "@domain/bond/clearinghold/service/DeleteClearingHoldDomainService"
import { DeleteClearingHoldDomainServiceRequest } from "@domain/bond/clearinghold/service/model/DeleteClearingHoldDomainServiceRequest"
import { ClearingStatus } from "@domain/bond/clearinghold/model/ClearingHold"
import { ClearingApprovedEvent } from "@domain/bond/clearinghold/event/ClearingApprovedEvent"
import { ClearingReclaimedEvent } from "@domain/bond/clearinghold/event/ClearingReclaimedEvent"
import { ClearingBalanceChangedEvent } from "@domain/bond/clearinghold/event/ClearingBalanceChangedEvent"

@Singleton()
export class ClearingOperationApprovedNestJSEventAdapter
  implements EventListener<ClearingOperationApprovedDLTEvent>
{
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
export class ClearingOperationReclaimedNestJSEventAdapter
  implements EventListener<ClearingOperationReclaimedDLTEvent>
{
  constructor(
    private readonly deleteClearingDomainService: DeleteClearingHoldDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Handler(ClearingOperationReclaimedDLTEvent)
  async handle(event: ClearingOperationReclaimedDLTEvent): Promise<void> {
    const request = new DeleteClearingHoldDomainServiceRequest()
    request.bondContractId = await ConverterUtils.getHederaAddressFromEvm(event.contractId)
    request.holderAccountId = await ConverterUtils.getHederaAddressFromEvm(event.tokenHolder)
    request.clearingId = event.clearingId

    const deletedClearing = await this.deleteClearingDomainService.execute(request)

    this.eventBus.publish(new ClearingReclaimedEvent(deletedClearing))
    this.eventBus.publish(
      new ClearingBalanceChangedEvent(
        deletedClearing.bondContractId,
        deletedClearing.holderAccountId,
        deletedClearing.partition,
        deletedClearing.amount,
        "CLEARING_UNLOCK",
      ),
    )
  }
}
