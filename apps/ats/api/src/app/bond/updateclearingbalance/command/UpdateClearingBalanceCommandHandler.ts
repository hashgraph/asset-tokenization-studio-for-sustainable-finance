// SPDX-License-Identifier: Apache-2.0
import {CommandHandler, Handler, Inject, Singleton} from "@hashgraph/green-bonds-shared-core"
import { UpdateClearingBalanceCommand } from "./UpdateClearingBalanceCommand"
import { ClearBondHolderBalanceDomainService } from "@domain/bond/holderbalance/service/ClearBondHolderBalanceDomainService"

@Singleton()
@Handler(UpdateClearingBalanceCommand)
export class UpdateClearingBalanceCommandHandler implements CommandHandler<UpdateClearingBalanceCommand, void> {
  constructor(private readonly clearBondHolderBalanceDomainService: ClearBondHolderBalanceDomainService) {}

  async execute(command: UpdateClearingBalanceCommand): Promise<void> {
    await this.clearBondHolderBalanceDomainService.execute(
      command.bondContractId,
      command.holderAccountId,
      command.partition,
      command.amount,
      command.operation,
    )
  }
}
