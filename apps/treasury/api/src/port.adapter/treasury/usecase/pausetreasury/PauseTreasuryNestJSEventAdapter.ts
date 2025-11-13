// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton, TokenPausedDLTEvent } from "@hashgraph/green-bonds-shared-core"
import { PauseTreasuryPort } from "@port/treasury/usecase/pausetreasury/PauseTreasuryPort"
import { PauseTreasuryCommand } from "@app/treasury/pausetreasury/command/PauseTreasuryCommand"

@Singleton()
export class PauseTreasuryNestJSEventAdapter implements PauseTreasuryPort, EventListener<TokenPausedDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(TokenPausedDLTEvent)
  async handle(event: TokenPausedDLTEvent): Promise<void> {
    await this.commandBus.execute(new PauseTreasuryCommand(event.contractId))
  }
}
