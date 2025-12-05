// SPDX-License-Identifier: Apache-2.0
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { DeleteBondHoldDomainService } from "@domain/hold/service/DeleteBondHoldDomainService"
import { DeleteBondHoldDomainServiceRequest } from "@domain/hold/service/model/DeleteBondHoldDomainServiceRequest"
import { ExecuteHoldBondHolderBalanceDomainService } from "@domain/holderbalance/service/ExecuteHoldBondHolderBalanceDomainService"
import { ExecutedBondHoldEvent } from "@domain/hold/event/ExecutedBondHoldEvent"
import { ExecuteBondHoldCommand } from "./ExecuteBondHoldCommand"

@Singleton()
@Handler(ExecuteBondHoldCommand)
export class ExecuteBondHoldCommandHandler implements CommandHandler<ExecuteBondHoldCommand, void> {
  constructor(
    private readonly deleteBondHoldDomainService: DeleteBondHoldDomainService,
    private readonly executeHoldBondHolderBalanceDomainService: ExecuteHoldBondHolderBalanceDomainService,
    @Inject() private readonly transactionManager: TransactionManager,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: ExecuteBondHoldCommand): Promise<void> {
    await this.transactionManager.execute(async (transactionId) => {
      await this.executeHoldBondHolderBalanceDomainService.execute(
        command.contractId,
        command.holderAccountId,
        command.toAccountId,
        command.partition,
        command.amount,
        transactionId,
      )

      await this.deleteBondHoldDomainService.execute(
        new DeleteBondHoldDomainServiceRequest(
          command.contractId,
          command.holderAccountId,
          command.holdId,
          command.partition,
        ),
      )

      this.eventBus.publish(
        new ExecutedBondHoldEvent(
          command.holdId,
          command.contractId,
          command.holderAccountId,
          command.toAccountId,
          command.partition,
          command.amount,
        ),
      )
    })
  }
}
