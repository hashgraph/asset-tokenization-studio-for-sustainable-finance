// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton, TokenUnpausedDLTEvent } from "@hashgraph/green-bonds-shared-core"
import { UnpausePrimaryMarketPort } from "@port/primarymarket/usecase/unpauseprimarymarket/UnpausePrimaryMarketPort"
import { UnpausePrimaryMarketCommand } from "@app/primarymarket/unpauseprimarymarket/command/UnpausePrimaryMarketCommand"

@Singleton()
export class UnpausePrimaryMarketNestJSEventAdapter
  implements UnpausePrimaryMarketPort, EventListener<TokenUnpausedDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(TokenUnpausedDLTEvent)
  async handle(event: TokenUnpausedDLTEvent): Promise<void> {
    await this.commandBus.execute(new UnpausePrimaryMarketCommand(event.contractId))
  }
}
