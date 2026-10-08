// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { CancelSubscriptionCommand } from "./CancelSubscriptionCommand"
import { CancelSubscriptionDomainService } from "@domain/subscription/services/CancelSubscriptionDomainService"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { SubscriptionCancelledEvent } from "@domain/subscription/event/SubscriptionCancelledEvent"

@Singleton()
@Handler(CancelSubscriptionCommand)
export class CancelSubscriptionCommandHandler implements CommandHandler<CancelSubscriptionCommand, void> {
  constructor(
    private readonly cancelSubscriptionDomainService: CancelSubscriptionDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: CancelSubscriptionCommand): Promise<void> {
    await this.cancelSubscriptionDomainService.execute(command)
    this.eventBus.publish(
      new SubscriptionCancelledEvent(command.offeringId, command.marketContractId, command.subscriptionId),
    )
  }
}
