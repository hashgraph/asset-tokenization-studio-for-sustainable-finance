// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton, TokenUnpausedDLTEvent } from "@hashgraph/green-bonds-shared-core"
import { UnpauseFactoryPort } from "./UnpauseFactoryPort"
import { UnpauseFactoryCommand } from "@app/factory/unpausefactory/command/UnpauseFactoryCommand"

@Singleton()
export class UnpauseFactoryNestJSEventAdapter implements UnpauseFactoryPort, EventListener<TokenUnpausedDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(TokenUnpausedDLTEvent)
  async handle(event: TokenUnpausedDLTEvent): Promise<void> {
    await this.commandBus.execute(new UnpauseFactoryCommand(event.contractId))
  }
}
