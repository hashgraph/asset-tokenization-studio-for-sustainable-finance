// SPDX-License-Identifier: Apache-2.0
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { DeleteBondHoldDomainService } from "@domain/bond/hold/service/DeleteBondHoldDomainService"
import { DeleteBondHoldDomainServiceRequest } from "@domain/bond/hold/service/model/DeleteBondHoldDomainServiceRequest"
import { ReleaseHoldBondHolderBalanceDomainService } from "@domain/bond/holderbalance/service/ReleaseHoldBondHolderBalanceDomainService"
import { ReclaimedBondHoldEvent } from "@domain/bond/hold/event/ReclaimedBondHoldEvent"
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
    await this.transactionManager.execute(async () => {
      await this.releaseHoldBondHolderBalanceDomainService.execute(
        command.contractId,
        command.holderAccountId,
        command.partition,
        command.amount,
      )

      await this.deleteBondHoldDomainService.execute(
        new DeleteBondHoldDomainServiceRequest(command.contractId, command.holderAccountId, command.holdId),
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
