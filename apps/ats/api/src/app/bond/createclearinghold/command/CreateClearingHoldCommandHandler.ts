// SPDX-License-Identifier: Apache-2.0
import type { EventBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { CreateClearingHoldCommand } from "./CreateClearingHoldCommand"
import { CreateClearingHoldDomainService } from "@domain/bond/clearing/service/CreateClearingHoldDomainService"
import { ClearingCreatedEvent } from "@domain/bond/clearing/event/ClearingCreatedEvent"
import { CreateClearingHoldDomainServiceRequest } from "@domain/bond/clearing/service/model/CreateClearingHoldDomainServiceRequest"
import { UpdateClearingBondHolderBalanceDomainService } from "@domain/bond/holderbalance/service/UpdateClearingBondHolderBalanceDomainService"

@Singleton()
@Handler(CreateClearingHoldCommand)
export class CreateClearingHoldCommandHandler implements CommandHandler<CreateClearingHoldCommand, void> {
  constructor(
    private readonly createClearingHoldDomainService: CreateClearingHoldDomainService,
    private readonly updateClearingBondHolderBalanceDomainService: UpdateClearingBondHolderBalanceDomainService,
    @Inject() private readonly transactionManager: TransactionManager,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: CreateClearingHoldCommand): Promise<void> {
    await this.transactionManager.execute(async (transactionId) => {
      const request = new CreateClearingHoldDomainServiceRequest()
      request.bondContractId = command.bondContractId
      request.holderAccountId = command.holderAccountId
      request.clearingId = command.clearingId
      request.partition = command.partition
      request.amount = command.amount
      request.expirationDate = command.expirationDate
      request.toAddress = command.toAccountId
      request.escrowAddress = command.escrowAccountId
      request.data = command.data
      request.operatorData = command.operatorData
      request.operator = command.operatorAccountId

      const savedClearing = await this.createClearingHoldDomainService.execute(request, transactionId)

      await this.updateClearingBondHolderBalanceDomainService.execute(
        savedClearing.bondContractId,
        savedClearing.holderAccountId,
        savedClearing.partition,
        savedClearing.amount,
        "CLEARING_LOCK",
        transactionId,
      )

      this.eventBus.publish(new ClearingCreatedEvent(savedClearing))
    })
  }
}
