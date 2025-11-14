// SPDX-License-Identifier: Apache-2.0
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { CreateClearingHoldCommand } from "./CreateClearingHoldCommand"
import { CreateClearingHoldDomainService } from "@domain/bond/clearinghold/service/CreateClearingHoldDomainService"
import { ClearingCreatedEvent } from "@domain/bond/clearinghold/event/ClearingCreatedEvent"
import { ClearingBalanceChangedEvent } from "@domain/bond/clearinghold/event/ClearingBalanceChangedEvent"
import { ClearingHold } from "@domain/bond/clearinghold/model/ClearingHold"
import { CreateClearingHoldDomainServiceRequest } from "@domain/bond/clearinghold/service/model/CreateClearingHoldDomainServiceRequest"

@Singleton()
@Handler(CreateClearingHoldCommand)
export class CreateClearingHoldCommandHandler implements CommandHandler<CreateClearingHoldCommand, void> {
  constructor(
    private readonly createClearingHoldDomainService: CreateClearingHoldDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: CreateClearingHoldCommand): Promise<void> {
    const request = new CreateClearingHoldDomainServiceRequest()
    request.bondContractId = command.bondContractId
    request.holderAccountId = command.holderAccountId
    request.clearingId = command.clearingId
    request.partition = command.partition
    request.amount = command.amount
    request.expirationDate = command.expirationDate
    request.toAddress = command.toAddress
    request.escrowAddress = command.escrowAddress
    request.data = command.data
    request.operatorData = command.operatorData
    request.operator = command.operator

    const savedClearing = await this.createClearingHoldDomainService.execute(request)

    this.eventBus.publish(new ClearingCreatedEvent(savedClearing))
    this.eventBus.publish(
      new ClearingBalanceChangedEvent(
        savedClearing.bondContractId,
        savedClearing.holderAccountId,
        savedClearing.partition,
        savedClearing.amount,
        "CLEARING_LOCK",
      ),
    )
  }
}
