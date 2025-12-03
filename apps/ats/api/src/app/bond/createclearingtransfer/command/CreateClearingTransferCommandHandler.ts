// SPDX-License-Identifier: Apache-2.0
import type { EventBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { CreateClearingTransferCommand } from "./CreateClearingTransferCommand"
import { CreateClearingTransferDomainService } from "@domain/bond/clearing/service/CreateClearingTransferDomainService"
import { ClearingCreatedEvent } from "@domain/bond/clearing/event/ClearingCreatedEvent"
import { CreateClearingTransferDomainServiceRequest } from "@domain/bond/clearing/service/model/CreateClearingTransferDomainServiceRequest"
import { UpdateClearingBondHolderBalanceDomainService } from "@domain/bond/holderbalance/service/UpdateClearingBondHolderBalanceDomainService"

@Singleton()
@Handler(CreateClearingTransferCommand)
export class CreateClearingTransferCommandHandler implements CommandHandler<CreateClearingTransferCommand, void> {
  constructor(
    private readonly createClearingTransferDomainService: CreateClearingTransferDomainService,
    private readonly updateClearingBondHolderBalanceDomainService: UpdateClearingBondHolderBalanceDomainService,
    @Inject() private readonly transactionManager: TransactionManager,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: CreateClearingTransferCommand): Promise<void> {
    await this.transactionManager.execute(async (transactionId) => {
      const request = new CreateClearingTransferDomainServiceRequest()
      request.bondContractId = command.bondContractId
      request.holderAccountId = command.holderAccountId
      request.clearingId = command.clearingId
      request.partition = command.partition
      request.amount = command.amount
      request.expirationDate = command.expirationDate
      request.toAccountId = command.toAccountId
      request.data = command.data
      request.operatorData = command.operatorData
      request.operatorAccountId = command.operatorAccountId

      const savedClearing = await this.createClearingTransferDomainService.execute(request, transactionId)

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
