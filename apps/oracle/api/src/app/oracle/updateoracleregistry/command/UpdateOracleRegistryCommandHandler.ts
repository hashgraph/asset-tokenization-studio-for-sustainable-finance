// SPDX-License-Identifier: Apache-2.0
import { Singleton, Handler, Validate, Inject, CommandHandler, Logger } from "@hashgraph/green-bonds-shared-core"
import { UpdateOracleRegistryCommand } from "./UpdateOracleRegistryCommand"
import type { OracleRegistryRepository } from "@domain/oracle/repositories/OracleRegistryRepository"
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry"
import { OracleRegistryNotFoundError } from "@domain/oracle/errors/OracleRegistryNotFoundError"

@Singleton()
@Handler(UpdateOracleRegistryCommand)
export class UpdateOracleRegistryCommandHandler implements CommandHandler<UpdateOracleRegistryCommand, OracleRegistry> {
  private readonly logger = new Logger(UpdateOracleRegistryCommandHandler.name)

  constructor(
    @Inject("OracleRegistryRepository")
    private readonly repository: OracleRegistryRepository,
  ) {}

  @Validate()
  async execute(command: UpdateOracleRegistryCommand): Promise<OracleRegistry> {
    this.logger.log(`Updating oracle registry ${command.id}`)

    const registry = await this.repository.findById(command.id)
    if (!registry) {
      throw OracleRegistryNotFoundError.idError(command.id)
    }

    // Update scheduler dates
    registry.updateSchedulerDates(command.schedulerStartDate, command.schedulerEndDate)

    const updated = await this.repository.save(registry)

    this.logger.log(`Oracle registry ${command.id} updated`)

    return updated
  }
}
