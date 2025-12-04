// SPDX-License-Identifier: Apache-2.0
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { SetBondDocumentCommand } from "./SetBondDocumentCommand"
import { SetBondDocumentDomainService } from "@domain/document/service/SetBondDocumentDomainService"
import { BondDocumentSetEvent } from "@domain/document/event/BondDocumentSetEvent"

@Singleton()
@Handler(SetBondDocumentCommand)
export class SetBondDocumentCommandHandler implements CommandHandler<SetBondDocumentCommand, void> {
  constructor(
    private readonly setBondDocumentDomainService: SetBondDocumentDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: SetBondDocumentCommand): Promise<void> {
    const bondDocument = await this.setBondDocumentDomainService.execute(command)
    this.eventBus.publish(
      new BondDocumentSetEvent(bondDocument.name, bondDocument.contractId, bondDocument.uri, bondDocument.hash),
    )
  }
}
