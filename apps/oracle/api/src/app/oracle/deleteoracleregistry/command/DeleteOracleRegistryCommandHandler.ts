// SPDX-License-Identifier: Apache-2.0
import { Inject, Logger, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteOracleRegistryCommand } from "./DeleteOracleRegistryCommand";
import type { OracleRegistryRepository } from "@domain/oracle/repositories/OracleRegistryRepository";

@CommandHandler(DeleteOracleRegistryCommand)
export class DeleteOracleRegistryCommandHandler
  implements ICommandHandler<DeleteOracleRegistryCommand, void>
{
  private readonly logger = new Logger(DeleteOracleRegistryCommandHandler.name);

  constructor(
    @Inject("OracleRegistryRepository")
    private readonly repository: OracleRegistryRepository,
  ) {}

  async execute(command: DeleteOracleRegistryCommand): Promise<void> {
    this.logger.log(`Deleting oracle registry ${command.id}`);

    const registry = await this.repository.findById(command.id);
    if (!registry) {
      throw new NotFoundException(`Oracle registry ${command.id} not found`);
    }

    await this.repository.delete(command.id);

    this.logger.log(`Oracle registry ${command.id} deleted`);
  }
}
