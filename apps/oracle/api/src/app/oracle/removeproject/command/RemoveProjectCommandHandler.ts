// SPDX-License-Identifier: Apache-2.0
import { Singleton, Handler, Validate, Inject, CommandHandler, Logger } from "@hashgraph/green-bonds-shared-core"
import { RemoveProjectCommand } from "./RemoveProjectCommand"
import type { OracleRegistryRepository } from "@domain/oracle/repositories/OracleRegistryRepository"
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry"
import { OracleRegistryNotFoundError } from "@domain/oracle/errors/OracleRegistryNotFoundError"

@Singleton()
@Handler(RemoveProjectCommand)
export class RemoveProjectCommandHandler implements CommandHandler<RemoveProjectCommand, OracleRegistry> {
  private readonly logger = new Logger(RemoveProjectCommandHandler.name)

  constructor(
    @Inject("OracleRegistryRepository")
    private readonly repository: OracleRegistryRepository,
  ) {}

  @Validate()
  async execute(command: RemoveProjectCommand): Promise<OracleRegistry> {
    this.logger.log(`Removing project ${command.projectId} from oracle registry ${command.registryId}`)

    const registry = await this.repository.findById(command.registryId)
    if (!registry) {
      throw OracleRegistryNotFoundError.idError(command.registryId)
    }

    registry.removeProject(command.projectId)

    const updated = await this.repository.save(registry)

    this.logger.log(`Project ${command.projectId} removed from registry ${command.registryId}`)

    return updated
  }
}
