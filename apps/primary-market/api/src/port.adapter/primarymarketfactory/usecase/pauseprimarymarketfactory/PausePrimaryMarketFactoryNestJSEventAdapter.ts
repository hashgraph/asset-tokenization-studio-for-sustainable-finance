// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton, TokenPausedDLTEvent } from "@hashgraph/green-bonds-shared-core"
import { PausePrimaryMarketFactoryPort } from "./PausePrimaryMarketFactoryPort"
import { PausePrimaryMarketFactoryCommand } from "@app/primarymarketfactory/pauseprimarymarketfactory/command/PausePrimaryMarketFactoryCommand"

@Singleton()
export class PausePrimaryMarketFactoryNestJSEventAdapter
  implements PausePrimaryMarketFactoryPort, EventListener<TokenPausedDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(TokenPausedDLTEvent)
  async handle(event: TokenPausedDLTEvent): Promise<void> {
    await this.commandBus.execute(new PausePrimaryMarketFactoryCommand(event.contractId))
  }
}
