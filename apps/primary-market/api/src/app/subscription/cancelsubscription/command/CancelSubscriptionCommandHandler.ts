// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { CancelSubscriptionCommand } from "./CancelSubscriptionCommand"
import { CancelSubscriptionDomainService } from "@domain/subscription/services/CancelSubscriptionDomainService"

@Singleton()
@Handler(CancelSubscriptionCommand)
export class CancelSubscriptionCommandHandler implements CommandHandler<CancelSubscriptionCommand, void> {
  constructor(private readonly cancelSubscriptionDomainService: CancelSubscriptionDomainService) {}

  @Validate()
  async execute(command: CancelSubscriptionCommand): Promise<void> {
    await this.cancelSubscriptionDomainService.execute(command)
  }
}
