import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { UpdateTreasuryBalanceCommand } from "@app/treasury/updatetreasurybalance/command/UpdateTreasuryBalanceCommand"
import { TransferDLTEvent } from "@port/treasury/usecase/updatetreasurybalance/model/TransferDLTEvent"
import { UpdateTreasuryBalancePort } from "@port/treasury/usecase/updatetreasurybalance/UpdateTreasuryBalancePort"

@Singleton()
export class UpdateTreasuryBalanceNestJSEventAdapter
  implements UpdateTreasuryBalancePort, EventListener<TransferDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(TransferDLTEvent)
  async handle(event: TransferDLTEvent): Promise<void> {
    await this.commandBus.execute(new UpdateTreasuryBalanceCommand(event.from, event.to, event.value))
  }
}
