// SPDX-License-Identifier: Apache-2.0
import { Inject, Logger, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateProjectTopicCommand } from "./UpdateProjectTopicCommand";
import type { OracleRegistryRepository } from "@domain/oracle/repositories/OracleRegistryRepository";
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry";

@CommandHandler(UpdateProjectTopicCommand)
export class UpdateProjectTopicCommandHandler
  implements ICommandHandler<UpdateProjectTopicCommand, OracleRegistry>
{
  private readonly logger = new Logger(UpdateProjectTopicCommandHandler.name);

  constructor(
    @Inject("OracleRegistryRepository")
    private readonly repository: OracleRegistryRepository,
  ) {}

  async execute(command: UpdateProjectTopicCommand): Promise<OracleRegistry> {
    this.logger.log(
      `Updating topic for project ${command.projectId} in registry ${command.registryId}`,
    );

    const registry = await this.repository.findById(command.registryId);
    if (!registry) {
      throw new NotFoundException(
        `Oracle registry ${command.registryId} not found`,
      );
    }

    registry.updateProjectTopic(command.projectId, command.topicId);

    const updated = await this.repository.save(registry);

    this.logger.log(
      `Topic updated for project ${command.projectId} to ${command.topicId}`,
    );

    return updated;
  }
}
