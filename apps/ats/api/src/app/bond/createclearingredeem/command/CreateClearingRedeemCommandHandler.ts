// SPDX-License-Identifier: Apache-2.0
import type { EventBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { CreateClearingRedeemCommand } from "./CreateClearingRedeemCommand"
import { CreateClearingRedeemDomainService } from "@domain/bond/clearing/service/CreateClearingRedeemDomainService"
import { ClearingRedeemCreatedEvent } from "@domain/bond/clearing/event/ClearingRedeemCreatedEvent"
import { CreateClearingRedeemDomainServiceRequest } from "@domain/bond/clearing/service/model/CreateClearingRedeemDomainServiceRequest"
import { ClearingBondHolderBalanceDomainService } from "@domain/bond/holderbalance/service/ClearingBondHolderBalanceDomainService"

@Singleton()
@Handler(CreateClearingRedeemCommand)
export class CreateClearingRedeemCommandHandler implements CommandHandler<CreateClearingRedeemCommand, void> {
  constructor(
    private readonly createClearingRedeemDomainService: CreateClearingRedeemDomainService,
    private readonly clearingBondHolderBalanceDomainService: ClearingBondHolderBalanceDomainService,
    @Inject() private readonly transactionManager: TransactionManager,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: CreateClearingRedeemCommand): Promise<void> {
    await this.transactionManager.execute(async () => {
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

      const savedClearing = await this.createClearingRedeemDomainService.execute(request)

      await this.clearingBondHolderBalanceDomainService.execute(
        savedClearing.bondContractId,
        savedClearing.holderAccountId,
        savedClearing.partition,
        savedClearing.amount,
        "CLEARING_LOCK",
      )

      this.eventBus.publish(new ClearingRedeemCreatedEvent(savedClearing))
    })
  }
}
