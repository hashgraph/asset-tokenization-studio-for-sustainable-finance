// SPDX-License-Identifier: Apache-2.0
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { DeleteBondHoldDomainService } from "@domain/bond/hold/service/DeleteBondHoldDomainService"
import { DeleteBondHoldDomainServiceRequest } from "@domain/bond/hold/service/model/DeleteBondHoldDomainServiceRequest"
import { ExecuteHoldBondHolderBalanceDomainService } from "@domain/bond/holderbalance/service/ExecuteHoldBondHolderBalanceDomainService"
import { ExecuteBondHoldCommand } from "./ExecuteBondHoldCommand"

@Singleton()
@Handler(ExecuteBondHoldCommand)
export class ExecuteBondHoldCommandHandler implements CommandHandler<ExecuteBondHoldCommand, void> {
  constructor(
    private readonly deleteBondHoldDomainService: DeleteBondHoldDomainService,
    private readonly executeHoldBondHolderBalanceDomainService: ExecuteHoldBondHolderBalanceDomainService,
    @Inject() private readonly transactionManager: TransactionManager,
  ) {}

  @Validate()
  async execute(command: ExecuteBondHoldCommand): Promise<void> {
    await this.transactionManager.execute(async () => {
      await this.executeHoldBondHolderBalanceDomainService.execute(
        command.contractId,
        command.holderAccountId,
        command.toAccountId,
        command.partition,
        command.amount,
      )

      await this.deleteBondHoldDomainService.execute(
        new DeleteBondHoldDomainServiceRequest(command.contractId, command.holderAccountId, command.holdId),
      )
    })
  }
}
