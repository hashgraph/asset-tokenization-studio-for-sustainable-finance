// SPDX-License-Identifier: Apache-2.0
import { type CommandBus, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { DocumentUpdatedDLTEvent } from "@port/document/usecase/setbonddocument/model/DocumentUpdatedDLTEvent"
import { SetBondDocumentCommand } from "@app/document/setbonddocument/command/SetBondDocumentCommand"
import { SetBondDocumentPort } from "@port/document/usecase/setbonddocument/SetBondDocumentPort"

@Singleton()
export class SetBondDocumentNestJSEventAdapter implements SetBondDocumentPort, EventListener<DocumentUpdatedDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(DocumentUpdatedDLTEvent)
  async handle(event: DocumentUpdatedDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new SetBondDocumentCommand(event.contractId, event._name, event._uri, event._documentHash),
    )
  }
}
