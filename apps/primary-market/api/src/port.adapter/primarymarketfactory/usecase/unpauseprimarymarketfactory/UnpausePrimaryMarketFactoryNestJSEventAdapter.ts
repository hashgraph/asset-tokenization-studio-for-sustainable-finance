// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton, TokenUnpausedDLTEvent } from "@hashgraph/green-bonds-shared-core"
import { UnpausePrimaryMarketFactoryPort } from "./UnpausePrimaryMarketFactoryPort"
import { UnpausePrimaryMarketFactoryCommand } from "@app/primarymarketfactory/unpauseprimarymarketfactory/command/UnpausePrimaryMarketFactoryCommand"

@Singleton()
export class UnpausePrimaryMarketFactoryNestJSEventAdapter
  implements UnpausePrimaryMarketFactoryPort, EventListener<TokenUnpausedDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(TokenUnpausedDLTEvent)
  async handle(event: TokenUnpausedDLTEvent): Promise<void> {
    await this.commandBus.execute(new UnpausePrimaryMarketFactoryCommand(event.contractId))
  }
}
