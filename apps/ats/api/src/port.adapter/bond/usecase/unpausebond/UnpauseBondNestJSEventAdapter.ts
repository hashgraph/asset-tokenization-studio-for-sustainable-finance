// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton, TokenUnpausedDLTEvent } from "@hashgraph/green-bonds-shared-core"
import { UnpauseBondPort } from "@port/bond/usecase/unpausebond/UnpauseBondPort"
import { UnpauseBondCommand } from "@app/bond/unpausebond/command/UnpauseBondCommand"

@Singleton()
export class UnpauseBondNestJSEventAdapter implements UnpauseBondPort, EventListener<TokenUnpausedDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(TokenUnpausedDLTEvent)
  async handle(event: TokenUnpausedDLTEvent): Promise<void> {
    await this.commandBus.execute(new UnpauseBondCommand(event.contractId))
  }
}
