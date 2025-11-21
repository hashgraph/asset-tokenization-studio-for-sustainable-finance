// SPDX-License-Identifier: Apache-2.0

import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Validate } from "@hashgraph/green-bonds-shared-core"
import { PauseBondCommand } from "@app/bond/pausebond/command/PauseBondCommand"
import type { BondRepository } from "@domain/bond/repositories/BondRepository"
import { BondPausedEvent } from "@domain/bond/events/BondPausedEvent"

@Handler(PauseBondCommand)
export class PauseBondCommandHandler implements CommandHandler<PauseBondCommand, void> {
  constructor(
    @Inject() private readonly bondRepository: BondRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: PauseBondCommand): Promise<void> {
    const bond = await this.bondRepository.findByContractId(command.bondContractId)

    if (!bond) {
      return
    }

    bond.pause()
    await this.bondRepository.save(bond)

    this.eventBus.publish(new BondPausedEvent(bond.contractId))
  }
}
