// SPDX-License-Identifier: Apache-2.0
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { SetBondCapCommand } from "./SetBondCapCommand"
import { SetBondCapDomainService } from "@domain/bond/services/cap/SetBondCapDomainService"
import { BondCapSetEvent } from "@domain/bond/events/cap/BondCapSetEvent"

@Singleton()
@Handler(SetBondCapCommand)
export class SetBondCapCommandHandler implements CommandHandler<SetBondCapCommand, void> {
  constructor(
    private readonly setBondCapDomainService: SetBondCapDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: SetBondCapCommand): Promise<void> {
    await this.setBondCapDomainService.execute(command)
    this.eventBus.publish(new BondCapSetEvent(command.contractId, command.newMaxSupply))
  }
}
