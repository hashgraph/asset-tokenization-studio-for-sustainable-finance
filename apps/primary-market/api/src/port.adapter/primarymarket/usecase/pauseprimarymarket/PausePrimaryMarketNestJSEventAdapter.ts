// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton, TokenPausedDLTEvent } from "@hashgraph/green-bonds-shared-core"
import { PausePrimaryMarketPort } from "@port/primarymarket/usecase/pauseprimarymarket/PausePrimaryMarketPort"
import { PausePrimaryMarketCommand } from "@app/primarymarket/pauseprimarymarket/command/PausePrimaryMarketCommand"

@Singleton()
export class PausePrimaryMarketNestJSEventAdapter
  implements PausePrimaryMarketPort, EventListener<TokenPausedDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(TokenPausedDLTEvent)
  async handle(event: TokenPausedDLTEvent): Promise<void> {
    await this.commandBus.execute(new PausePrimaryMarketCommand(event.contractId))
  }
}
