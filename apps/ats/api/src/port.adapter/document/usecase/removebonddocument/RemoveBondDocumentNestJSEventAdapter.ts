// SPDX-License-Identifier: Apache-2.0
import { type CommandBus, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { DocumentRemovedDLTEvent } from "@port/document/usecase/removebonddocument/model/DocumentRemovedDLTEvent"
import { RemoveBondDocumentCommand } from "@app/document/removebonddocument/command/RemoveBondDocumentCommand"
import { RemoveBondDocumentPort } from "@port/document/usecase/removebonddocument/RemoveBondDocumentPort"

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
