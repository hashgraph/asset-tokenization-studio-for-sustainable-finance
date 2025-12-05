// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { TransferByPartitionCommand } from "./TransferByPartitionCommand"
import { TransferBondHolderBalanceDomainService } from "@domain/holderbalance/service/TransferBondHolderBalanceDomainService"
import { TransferByPartitionEvent } from "@domain/holderbalance/events/TransferByPartitionEvent"

@Singleton()
@Handler(TransferByPartitionCommand)
export class TransferByPartitionCommandHandler implements CommandHandler<TransferByPartitionCommand, void> {
  constructor(
    private readonly transferBondHolderBalanceDomainService: TransferBondHolderBalanceDomainService,
    @Inject() private readonly transactionManager: TransactionManager,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: TransferByPartitionCommand): Promise<void> {
    await this.transactionManager.execute(async (transactionId) => {
      await this.transferBondHolderBalanceDomainService.execute(
        command.bondContractId,
        command.fromAccountId,
        command.toAccountId,
        command.partition,
        command.amount,
        transactionId,
      )
      this.eventBus.publish(
        new TransferByPartitionEvent(
          command.bondContractId,
          command.partition,
          command.fromAccountId,
          command.toAccountId,
          command.amount,
          command.operatorAccountId,
        ),
      )
    })
  }
}
