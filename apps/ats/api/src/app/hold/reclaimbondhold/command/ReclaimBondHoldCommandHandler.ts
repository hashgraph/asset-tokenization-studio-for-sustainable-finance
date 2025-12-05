// SPDX-License-Identifier: Apache-2.0
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { DeleteBondHoldDomainService } from "@domain/hold/service/DeleteBondHoldDomainService"
import { DeleteBondHoldDomainServiceRequest } from "@domain/hold/service/model/DeleteBondHoldDomainServiceRequest"
import { ReleaseHoldBondHolderBalanceDomainService } from "@domain/holderbalance/service/ReleaseHoldBondHolderBalanceDomainService"
import { ReclaimedBondHoldEvent } from "@domain/hold/event/ReclaimedBondHoldEvent"
import { ReclaimBondHoldCommand } from "./ReclaimBondHoldCommand"

@Singleton()
@Handler(ReclaimBondHoldCommand)
export class ReclaimBondHoldCommandHandler implements CommandHandler<ReclaimBondHoldCommand, void> {
  constructor(
    private readonly deleteBondHoldDomainService: DeleteBondHoldDomainService,
    private readonly releaseHoldBondHolderBalanceDomainService: ReleaseHoldBondHolderBalanceDomainService,
    @Inject() private readonly transactionManager: TransactionManager,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: ReclaimBondHoldCommand): Promise<void> {
    await this.transactionManager.execute(async (transactionId) => {
      await this.releaseHoldBondHolderBalanceDomainService.execute(
        command.contractId,
        command.holderAccountId,
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
        new ReclaimedBondHoldEvent(
          command.holdId,
          command.contractId,
          command.holderAccountId,
          command.partition,
          command.amount,
        ),
      )
    })
  }
}
