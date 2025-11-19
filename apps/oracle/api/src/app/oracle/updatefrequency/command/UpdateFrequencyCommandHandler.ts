// SPDX-License-Identifier: Apache-2.0
import { Singleton, Handler, Validate, Inject, CommandHandler, Logger } from "@hashgraph/green-bonds-shared-core"
import { UpdateFrequencyCommand } from "./UpdateFrequencyCommand"
import type { OracleRegistryRepository } from "@domain/oracle/repositories/OracleRegistryRepository"
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry"
import { OracleRegistryNotFoundError } from "@domain/oracle/errors/OracleRegistryNotFoundError"

@Singleton()
@Handler(UpdateFrequencyCommand)
export class UpdateFrequencyCommandHandler implements CommandHandler<UpdateFrequencyCommand, OracleRegistry> {
  private readonly logger = new Logger(UpdateFrequencyCommandHandler.name)

  constructor(
    @Inject("OracleRegistryRepository")
    private readonly repository: OracleRegistryRepository,
  ) {}

  @Validate()
  async execute(command: UpdateFrequencyCommand): Promise<OracleRegistry> {
    this.logger.log(`Updating frequency for registry ${command.registryId} to ${command.frequencyMinutes} minutes`)

    const registry = await this.repository.findById(command.registryId)
    if (!registry) {
      throw OracleRegistryNotFoundError.idError(command.registryId)
    }

    registry.updateFrequency(command.frequencyMinutes)

    const updated = await this.repository.save(registry)

    this.logger.log(`Frequency updated for registry ${command.registryId} to ${command.frequencyMinutes} minutes`)

    return updated
  }
}
