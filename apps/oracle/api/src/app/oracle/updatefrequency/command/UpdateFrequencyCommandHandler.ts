// SPDX-License-Identifier: Apache-2.0
import { Inject, Logger, NotFoundException } from "@nestjs/common"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { UpdateFrequencyCommand } from "./UpdateFrequencyCommand"
import type { OracleRegistryRepository } from "@domain/oracle/repositories/OracleRegistryRepository"
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry"

@CommandHandler(UpdateFrequencyCommand)
export class UpdateFrequencyCommandHandler implements ICommandHandler<UpdateFrequencyCommand, OracleRegistry> {
  private readonly logger = new Logger(UpdateFrequencyCommandHandler.name)

  constructor(
    @Inject("OracleRegistryRepository")
    private readonly repository: OracleRegistryRepository,
  ) {}

  async execute(command: UpdateFrequencyCommand): Promise<OracleRegistry> {
    this.logger.log(`Updating frequency for registry ${command.registryId} to ${command.frequencyMinutes} minutes`)

    const registry = await this.repository.findById(command.registryId)
    if (!registry) {
      throw new NotFoundException(`Oracle registry ${command.registryId} not found`)
    }

    registry.updateFrequency(command.frequencyMinutes)

    const updated = await this.repository.save(registry)

    this.logger.log(`Frequency updated for registry ${command.registryId} to ${command.frequencyMinutes} minutes`)

    return updated
  }
}
