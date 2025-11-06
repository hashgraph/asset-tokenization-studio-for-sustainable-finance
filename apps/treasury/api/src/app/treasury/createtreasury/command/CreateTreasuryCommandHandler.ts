// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CreateTreasuryCommand } from "@app/treasury/createtreasury/command/CreateTreasuryCommand"
import type { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import { Treasury } from "@domain/treasury/model/Treasury"
import { TreasuryCreatedEvent } from "@domain/treasury/event/TreasuryCreatedEvent"

@Singleton()
@Handler(CreateTreasuryCommand)
export class CreateTreasuryCommandHandler implements CommandHandler<CreateTreasuryCommand, void> {
  constructor(
    @Inject() private readonly treasuryRepository: TreasuryRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: CreateTreasuryCommand): Promise<void> {
    const now = new Date()
    const treasury = await this.treasuryRepository.save({
      contractId: command.treasuryContractId,
      bondContractId: command.bondContractId,
      paused: false
    } as Treasury)

    this.eventBus.publish(new TreasuryCreatedEvent(treasury.contractId))
  }
}
