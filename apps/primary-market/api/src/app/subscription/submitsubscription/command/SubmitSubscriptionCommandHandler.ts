// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { SubmitSubscriptionCommand } from "./SubmitSubscriptionCommand"
import { SubmitSubscriptionDomainService } from "@domain/subscription/services/SubmitSubscriptionDomainService"
import { SubscriptionSubmittedEvent } from "@domain/subscription/event/SubscriptionSubmittedEvent"

@Singleton()
@Handler(SubmitSubscriptionCommand)
export class SubmitSubscriptionCommandHandler implements CommandHandler<SubmitSubscriptionCommand, void> {
  constructor(
    private readonly submitSubscriptionDomainService: SubmitSubscriptionDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: SubmitSubscriptionCommand): Promise<void> {
    const subscription = await this.submitSubscriptionDomainService.execute(command)
    this.eventBus.publish(
      new SubscriptionSubmittedEvent(
        subscription.offering.offeringId,
        subscription.subscriptionId,
        subscription.status,
        subscription.investor.accountId,
        subscription.lotUnits,
      ),
    )
  }
}
