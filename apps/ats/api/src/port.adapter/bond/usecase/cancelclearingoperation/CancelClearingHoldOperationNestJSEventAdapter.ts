// SPDX-License-Identifier: Apache-2.0
import { ConverterUtils, EventListener, Handler, Singleton, Inject } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { ClearingOperationCanceledDLTEvent } from "@port/bond/usecase/cancelclearingoperation/model/ClearingOperationCanceledDLTEvent"
import { DeleteClearingHoldDomainService } from "@domain/bond/clearinghold/service/DeleteClearingHoldDomainService"
import { DeleteClearingHoldDomainServiceRequest } from "@domain/bond/clearinghold/service/model/DeleteClearingHoldDomainServiceRequest"
import { ClearingCanceledEvent } from "@domain/bond/clearinghold/event/ClearingCanceledEvent"
import { ClearingBalanceChangedEvent } from "@domain/bond/clearinghold/event/ClearingBalanceChangedEvent"
import {
    CancelClearingHoldOperationPort
} from "@port/bond/usecase/cancelclearingoperation/CancelClearingHoldOperationPort";

@Singleton()
export class CancelClearingHoldOperationNestJSEventAdapter
  implements CancelClearingHoldOperationPort, EventListener<ClearingOperationCanceledDLTEvent>
{
  constructor(
    private readonly deleteClearingDomainService: DeleteClearingHoldDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Handler(ClearingOperationCanceledDLTEvent)
  async handle(event: ClearingOperationCanceledDLTEvent): Promise<void> {
    const request = new DeleteClearingHoldDomainServiceRequest()
    request.bondContractId = await ConverterUtils.getHederaAddressFromEvm(event.contractId)
    request.holderAccountId = await ConverterUtils.getHederaAddressFromEvm(event.tokenHolder)
    request.clearingId = event.clearingId

    const deletedClearing = await this.deleteClearingDomainService.execute(request)

    this.eventBus.publish(new ClearingCanceledEvent(deletedClearing))
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
