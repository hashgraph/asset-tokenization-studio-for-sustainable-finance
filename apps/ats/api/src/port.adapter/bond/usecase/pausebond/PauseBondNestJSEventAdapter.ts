// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton, TokenPausedDLTEvent } from "@hashgraph/green-bonds-shared-core"
import { PauseBondPort } from "@port/bond/usecase/pausebond/PauseBondPort"
import { PauseBondCommand } from "@app/bond/pausebond/command/PauseBondCommand"

@Singleton()
export class PauseBondNestJSEventAdapter implements PauseBondPort, EventListener<TokenPausedDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(TokenPausedDLTEvent)
  async handle(event: TokenPausedDLTEvent): Promise<void> {
    await this.commandBus.execute(new PauseBondCommand(event.contractId))
  }
}
