// SPDX-License-Identifier: Apache-2.0
import {
  Singleton,
  Handler,
  Validate,
  CommandHandler as ICommandHandler,
  Logger,
} from "@hashgraph/green-bonds-shared-core"
import { DeleteOracleRegistryCommand } from "./DeleteOracleRegistryCommand"
import type { OracleRegistryRepository } from "@domain/oracle/repositories/OracleRegistryRepository"
import { OracleRegistryNotFoundError } from "@domain/oracle/errors/OracleRegistryNotFoundError"

@Singleton()
@Handler(DeleteOracleRegistryCommand)
export class DeleteOracleRegistryCommandHandler implements ICommandHandler<DeleteOracleRegistryCommand, void> {
  private readonly logger = new Logger(DeleteOracleRegistryCommandHandler.name)

  constructor(private readonly repository: OracleRegistryRepository) {}

  @Validate()
  async execute(command: DeleteOracleRegistryCommand): Promise<void> {
    this.logger.log(`Deleting oracle registry ${command.id}`)

    const registry = await this.repository.findById(command.id)
    if (!registry) {
      throw OracleRegistryNotFoundError.idError(command.id)
    }

    await this.repository.delete(command.id)

    this.logger.log(`Oracle registry ${command.id} deleted`)
  }
}
