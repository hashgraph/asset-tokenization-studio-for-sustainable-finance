// SPDX-License-Identifier: Apache-2.0
import { EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { ClearingBalanceChangedEvent } from "@domain/bond/clearinghold/event/ClearingBalanceChangedEvent"
import { ManageClearingBalancePort } from "./ManageClearingBalancePort"
import { UpdateClearingBalanceCommand } from "@app/bond/updateclearingbalance/command/UpdateClearingBalanceCommand"

@Singleton()
export class ManageClearingBalanceNestJSEventAdapter
  implements ManageClearingBalancePort, EventListener<ClearingBalanceChangedEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(ClearingBalanceChangedEvent)
  async handle(event: ClearingBalanceChangedEvent): Promise<void> {
    await this.commandBus.execute(
      new UpdateClearingBalanceCommand(
        event.bondContractId,
        event.holderAccountId,
        event.partition,
        event.amount,
        event.balanceOperation,
      ),
    )
  }
}
