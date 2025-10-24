// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { TokenUnpausedDLTEvent } from "@port/treasury/usecase/unpausetreasury/model/TokenUnpausedDLTEvent"
import { UnpauseTreasuryPort } from "@port/treasury/usecase/unpausetreasury/UnpauseTreasuryPort"
import { UnpauseTreasuryCommand } from "@app/treasury/unpausetreasury/command/UnpauseTreasuryCommand"

@Singleton()
export class UnpauseTreasuryNestJSEventAdapter implements UnpauseTreasuryPort, EventListener<TokenUnpausedDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(TokenUnpausedDLTEvent)
  async handle(event: TokenUnpausedDLTEvent): Promise<void> {
    await this.commandBus.execute(new UnpauseTreasuryCommand(event.contractId))
  }
}
