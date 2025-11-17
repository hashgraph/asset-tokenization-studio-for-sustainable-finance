// SPDX-License-Identifier: Apache-2.0
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { RemoveProceedRecipientCommand } from "./RemoveProceedRecipientCommand"
import { RemoveBondProceedRecipientDomainService } from "@domain/bond/proceedrecipient/service/RemoveBondProceedRecipientDomainService"
import { BondProceedRecipientRemovedEvent } from "@domain/bond/proceedrecipient/event/BondProceedRecipientRemovedEvent"

@Singleton()
@Handler(RemoveProceedRecipientCommand)
export class RemoveProceedRecipientCommandHandler implements CommandHandler<RemoveProceedRecipientCommand, void> {
  constructor(
    private readonly removeBondProceedRecipientDomainService: RemoveBondProceedRecipientDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: RemoveProceedRecipientCommand): Promise<void> {
    await this.removeBondProceedRecipientDomainService.execute(command)
    this.eventBus.publish(new BondProceedRecipientRemovedEvent(command.contractId, command.proceedRecipientAddress))
  }
}
