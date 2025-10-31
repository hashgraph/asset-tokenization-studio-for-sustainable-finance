// SPDX-License-Identifier: Apache-2.0
import { type CommandBus, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { DocumentRemovedDLTEvent } from "@port/bond/usecase/removebonddocument/model/DocumentRemovedDLTEvent"
import { RemoveBondDocumentCommand } from "@app/bond/removebonddocument/command/RemoveBondDocumentCommand"
import { RemoveBondDocumentPort } from "@port/bond/usecase/removebonddocument/RemoveBondDocumentPort"

@Singleton()
export class RemoveBondDocumentNestJSEventAdapter
  implements RemoveBondDocumentPort, EventListener<DocumentRemovedDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(DocumentRemovedDLTEvent)
  async handle(event: DocumentRemovedDLTEvent): Promise<void> {
    await this.commandBus.execute(new RemoveBondDocumentCommand(event.contractId, event._name))
  }
}
