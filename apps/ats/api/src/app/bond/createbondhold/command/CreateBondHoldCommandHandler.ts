// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { CreateBondHoldDomainService } from "@domain/bond/hold/service/CreateBondHoldDomainService"
import { CreatedBondHoldEvent } from "@domain/bond/hold/event/CreatedBondHoldEvent"
import { CreateBondHoldCommand } from "./CreateBondHoldCommand"

@Singleton()
@Handler(CreateBondHoldCommand)
export class CreateBondHoldCommandHandler implements CommandHandler<CreateBondHoldCommand, void> {
  constructor(
    private readonly createBondHoldDomainService: CreateBondHoldDomainService,
    @Inject() private readonly transactionManager: TransactionManager,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: CreateBondHoldCommand): Promise<void> {
    await this.transactionManager.execute(async () => {
      const bondHold = await this.createBondHoldDomainService.execute(command)

      this.eventBus.publish(
        new CreatedBondHoldEvent(
          bondHold.id,
          bondHold.contractId,
          bondHold.holderAccountId,
          bondHold.partition,
          bondHold.amount,
          bondHold.expirationTimestamp,
          bondHold.escrowAccountId,
          bondHold.toAccountId,
          bondHold.data,
          bondHold.operatorAccountId,
        ),
      )
    })
  }
}
