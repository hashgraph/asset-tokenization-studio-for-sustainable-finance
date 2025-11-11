// SPDX-License-Identifier: Apache-2.0
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { RemoveBondDocumentCommand } from "./RemoveBondDocumentCommand"
import { RemoveBondDocumentDomainService } from "@domain/bond/document/service/RemoveBondDocumentDomainService"
import { BondDocumentRemovedEvent } from "@domain/bond/document/event/BondDocumentRemovedEvent"

@Singleton()
@Handler(RemoveBondDocumentCommand)
export class RemoveBondDocumentCommandHandler implements CommandHandler<RemoveBondDocumentCommand, void> {
  constructor(
    private readonly removeBondDocumentDomainService: RemoveBondDocumentDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: RemoveBondDocumentCommand): Promise<void> {
    await this.removeBondDocumentDomainService.execute(command)
    this.eventBus.publish(new BondDocumentRemovedEvent(command.name, command.contractId))
  }
}
