// SPDX-License-Identifier: Apache-2.0
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { AddProceedRecipientCommand } from "./AddProceedRecipientCommand"
import { AddBondProceedRecipientDomainService } from "@domain/proceedrecipient/service/AddBondProceedRecipientDomainService"
import { BondProceedRecipientAddedEvent } from "@domain/proceedrecipient/event/BondProceedRecipientAddedEvent"

@Singleton()
@Handler(AddProceedRecipientCommand)
export class AddProceedRecipientCommandHandler implements CommandHandler<AddProceedRecipientCommand, void> {
  constructor(
    private readonly addBondProceedRecipientDomainService: AddBondProceedRecipientDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: AddProceedRecipientCommand): Promise<void> {
    const recipient = await this.addBondProceedRecipientDomainService.execute(command)
    this.eventBus.publish(
      new BondProceedRecipientAddedEvent(recipient.contractId, recipient.proceedRecipientAddress, recipient.data),
    )
  }
}
