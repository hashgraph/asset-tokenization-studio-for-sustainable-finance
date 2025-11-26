// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { ExecuteOfferingCommand } from "./ExecuteOfferingCommand"
import { ProcessOfferingDomainService } from "@domain/offering/services/ProcessOfferingDomainService"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { OfferingExecutedEvent } from "@domain/offering/event/OfferingExecutedEvent"

@Singleton()
@Handler(ExecuteOfferingCommand)
export class ExecuteOfferingCommandHandler implements CommandHandler<ExecuteOfferingCommand, void> {
  constructor(
    private readonly processOfferingDomainService: ProcessOfferingDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: ExecuteOfferingCommand): Promise<void> {
    await this.processOfferingDomainService.execute(command)
    this.eventBus.publish(
      new OfferingExecutedEvent(
        command.offeringId,
        command.marketContractId,
        command.operatorAccountId,
        command.processResults,
      ),
    )
  }
}
