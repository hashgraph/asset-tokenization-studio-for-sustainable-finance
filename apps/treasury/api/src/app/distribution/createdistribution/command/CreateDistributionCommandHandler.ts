// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CreateDistributionCommand } from "@app/distribution/createdistribution/command/CreateDistributionCommand"
import type { DistributionRepository } from "@domain/distribution/repositories/DistributionRepository"
import { Distribution } from "@domain/distribution/model/Distribution"
import { DistributionCreatedEvent } from "@domain/distribution/event/DistributionCreatedEvent"

@Singleton()
@Handler(CreateDistributionCommand)
export class CreateDistributionCommandHandler implements CommandHandler<CreateDistributionCommand, void> {
  constructor(
    @Inject() private readonly distributionRepository: DistributionRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: CreateDistributionCommand): Promise<void> {
    const now = new Date()
    const distribution = await this.distributionRepository.save({
      id: command.distributionId,
      treasuryId: command.treasuryId,
      createdAt: now,
      updatedAt: now,
    } as Distribution)

    this.eventBus.publish(new DistributionCreatedEvent(distribution.id, command.treasuryId))
  }
}
