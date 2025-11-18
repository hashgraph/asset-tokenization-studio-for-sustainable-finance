// SPDX-License-Identifier: Apache-2.0
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { DeleteBondHoldDomainService } from "@domain/bond/hold/service/DeleteBondHoldDomainService"
import { DeleteBondHoldDomainServiceRequest } from "@domain/bond/hold/service/model/DeleteBondHoldDomainServiceRequest"
import { ReleaseHoldBondHolderBalanceDomainService } from "@domain/bond/holderbalance/service/ReleaseHoldBondHolderBalanceDomainService"
import { ReclaimBondHoldCommand } from "./ReclaimBondHoldCommand"

@Singleton()
@Handler(ReclaimBondHoldCommand)
export class ReclaimBondHoldCommandHandler implements CommandHandler<ReclaimBondHoldCommand, void> {
  constructor(
    private readonly deleteBondHoldDomainService: DeleteBondHoldDomainService,
    private readonly releaseHoldBondHolderBalanceDomainService: ReleaseHoldBondHolderBalanceDomainService,
    @Inject() private readonly transactionManager: TransactionManager,
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
    })
  }
}
