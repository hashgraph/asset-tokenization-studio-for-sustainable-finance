// SPDX-License-Identifier: Apache-2.0
import { type CommandBus, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { ProceedRecipientRemovedDLTEvent } from "@port/bond/usecase/removeproceedrecipient/model/ProceedRecipientRemovedDLTEvent"
import { RemoveProceedRecipientCommand } from "@app/bond/removeproceedrecipient/command/RemoveProceedRecipientCommand"
import { RemoveProceedRecipientPort } from "@port/bond/usecase/removeproceedrecipient/RemoveProceedRecipientPort"

@Singleton()
export class RemoveProceedRecipientNestJSEventAdapter
  implements RemoveProceedRecipientPort, EventListener<ProceedRecipientRemovedDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(ProceedRecipientRemovedDLTEvent)
  async handle(event: ProceedRecipientRemovedDLTEvent): Promise<void> {
    await this.commandBus.execute(new RemoveProceedRecipientCommand(event.contractId, event.proceedRecipient))
  }
}
