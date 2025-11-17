// SPDX-License-Identifier: Apache-2.0
import { type CommandBus, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { ProceedRecipientAddedDLTEvent } from "@port/bond/usecase/addproceedrecipient/model/ProceedRecipientAddedDLTEvent"
import { AddProceedRecipientCommand } from "@app/bond/addproceedrecipient/command/AddProceedRecipientCommand"
import { AddProceedRecipientPort } from "@port/bond/usecase/addproceedrecipient/AddProceedRecipientPort"

@Singleton()
export class AddProceedRecipientNestJSEventAdapter
  implements AddProceedRecipientPort, EventListener<ProceedRecipientAddedDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(ProceedRecipientAddedDLTEvent)
  async handle(event: ProceedRecipientAddedDLTEvent): Promise<void> {
    await this.commandBus.execute(new AddProceedRecipientCommand(event.contractId, event.proceedRecipient, event.data))
  }
}
