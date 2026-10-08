// SPDX-License-Identifier: Apache-2.0
import { CommandHandler, Handler, Singleton } from "@hashgraph/green-bonds-shared-core"
import { UpdateBondHolderBalanceCommand } from "./UpdateBondHolderBalanceCommand"
import { UpdateBondHolderBalanceDomainService } from "@domain/holderbalance/service/UpdateBondHolderBalanceDomainService"

@Singleton()
@Handler(UpdateBondHolderBalanceCommand)
export class UpdateBondHolderBalanceCommandHandler implements CommandHandler<UpdateBondHolderBalanceCommand, void> {
  constructor(private readonly updateBondHolderBalanceDomainService: UpdateBondHolderBalanceDomainService) {}

  async execute(command: UpdateBondHolderBalanceCommand): Promise<void> {
    await this.updateBondHolderBalanceDomainService.execute(
      command.bondContractId,
      command.holderAccountId,
      command.partition,
      command.amount,
    )
  }
}
