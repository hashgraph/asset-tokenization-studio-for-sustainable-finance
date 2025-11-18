// SPDX-License-Identifier: Apache-2.0
import { Inject, Logger, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateOracleRegistryCommand } from "./UpdateOracleRegistryCommand";
import type { OracleRegistryRepository } from "@domain/oracle/repositories/OracleRegistryRepository";
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry";

@CommandHandler(UpdateOracleRegistryCommand)
export class UpdateOracleRegistryCommandHandler
  implements ICommandHandler<UpdateOracleRegistryCommand, OracleRegistry>
{
  private readonly logger = new Logger(UpdateOracleRegistryCommandHandler.name);

  constructor(
    @Inject("OracleRegistryRepository")
    private readonly repository: OracleRegistryRepository,
  ) {}

  async execute(command: UpdateOracleRegistryCommand): Promise<OracleRegistry> {
    this.logger.log(`Updating oracle registry ${command.id}`);

    const registry = await this.repository.findById(command.id);
    if (!registry) {
      throw new NotFoundException(`Oracle registry ${command.id} not found`);
    }

    // Update scheduler dates
    registry.updateSchedulerDates(
      command.schedulerStartDate,
      command.schedulerEndDate,
    );

    const updated = await this.repository.save(registry);

    this.logger.log(`Oracle registry ${command.id} updated`);

    return updated;
  }
}
