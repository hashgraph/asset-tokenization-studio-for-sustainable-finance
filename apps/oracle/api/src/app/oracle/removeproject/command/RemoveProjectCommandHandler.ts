// SPDX-License-Identifier: Apache-2.0
import { Inject, Logger, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RemoveProjectCommand } from "./RemoveProjectCommand";
import type { OracleRegistryRepository } from "@domain/oracle/repositories/OracleRegistryRepository";
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry";

@CommandHandler(RemoveProjectCommand)
export class RemoveProjectCommandHandler
  implements ICommandHandler<RemoveProjectCommand, OracleRegistry>
{
  private readonly logger = new Logger(RemoveProjectCommandHandler.name);

  constructor(
    @Inject("OracleRegistryRepository")
    private readonly repository: OracleRegistryRepository,
  ) {}

  async execute(command: RemoveProjectCommand): Promise<OracleRegistry> {
    this.logger.log(
      `Removing project ${command.projectId} from oracle registry ${command.registryId}`,
    );

    const registry = await this.repository.findById(command.registryId);
    if (!registry) {
      throw new NotFoundException(
        `Oracle registry ${command.registryId} not found`,
      );
    }

    registry.removeProject(command.projectId);

    const updated = await this.repository.save(registry);

    this.logger.log(
      `Project ${command.projectId} removed from registry ${command.registryId}`,
    );

    return updated;
  }
}
