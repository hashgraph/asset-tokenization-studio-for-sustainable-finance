// SPDX-License-Identifier: Apache-2.0
import type { EventBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { CreateClearingRedeemCommand } from "./CreateClearingRedeemCommand"
import { CreateClearingRedeemDomainService } from "@domain/clearing/service/CreateClearingRedeemDomainService"
import { ClearingRedeemCreatedEvent } from "@domain/clearing/event/ClearingRedeemCreatedEvent"
import { CreateClearingRedeemDomainServiceRequest } from "@domain/clearing/service/model/CreateClearingRedeemDomainServiceRequest"
import { UpdateClearingBondHolderBalanceDomainService } from "@domain/holderbalance/service/UpdateClearingBondHolderBalanceDomainService"

@Singleton()
@Handler(CreateClearingRedeemCommand)
export class CreateClearingRedeemCommandHandler implements CommandHandler<CreateClearingRedeemCommand, void> {
  constructor(
    private readonly createClearingRedeemDomainService: CreateClearingRedeemDomainService,
    private readonly updateClearingBondHolderBalanceDomainService: UpdateClearingBondHolderBalanceDomainService,
    @Inject() private readonly transactionManager: TransactionManager,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: CreateClearingRedeemCommand): Promise<void> {
    await this.transactionManager.execute(async (transactionId) => {
      const request = new CreateClearingRedeemDomainServiceRequest()
      request.bondContractId = command.bondContractId
      request.holderAccountId = command.holderAccountId
      request.clearingId = command.clearingId
      request.partition = command.partition
      request.amount = command.amount
      request.expirationDate = command.expirationDate
      request.data = command.data
      request.operatorData = command.operatorData
      request.operator = command.operatorAccountId

      const savedClearing = await this.createClearingRedeemDomainService.execute(request, transactionId)

      await this.updateClearingBondHolderBalanceDomainService.execute(
        savedClearing.bondContractId,
        savedClearing.holderAccountId,
        savedClearing.partition,
        savedClearing.amount,
        "CLEARING_LOCK",
        transactionId,
      )

      this.eventBus.publish(new ClearingRedeemCreatedEvent(savedClearing))
    })
  }
}
