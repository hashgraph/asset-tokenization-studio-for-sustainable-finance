// SPDX-License-Identifier: Apache-2.0

import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Validate } from "@hashgraph/green-bonds-shared-core"
import { UnpauseBondCommand } from "@app/bond/unpausebond/command/UnpauseBondCommand"
import type { BondRepository } from "@domain/bond/repositories/BondRepository"
import { BondUnpausedEvent } from "@domain/bond/events/BondUnpausedEvent"

@Handler(UnpauseBondCommand)
export class UnpauseBondCommandHandler implements CommandHandler<UnpauseBondCommand, void> {
  constructor(
    @Inject() private readonly bondRepository: BondRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: UnpauseBondCommand): Promise<void> {
    const bond = await this.bondRepository.findByContractId(command.bondContractId)

    if (!bond) {
      return
    }

    bond.unpause()
    await this.bondRepository.save(bond)

    this.eventBus.publish(new BondUnpausedEvent(bond.contractId))
  }
}
