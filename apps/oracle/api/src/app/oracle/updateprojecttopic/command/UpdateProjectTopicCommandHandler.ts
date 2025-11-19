// SPDX-License-Identifier: Apache-2.0
import { Singleton, Handler, Validate, Inject, CommandHandler, Logger } from "@hashgraph/green-bonds-shared-core"
import { UpdateProjectTopicCommand } from "./UpdateProjectTopicCommand"
import type { OracleRegistryRepository } from "@domain/oracle/repositories/OracleRegistryRepository"
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry"
import { OracleRegistryNotFoundError } from "@domain/oracle/errors/OracleRegistryNotFoundError"

@Singleton()
@Handler(UpdateProjectTopicCommand)
export class UpdateProjectTopicCommandHandler implements CommandHandler<UpdateProjectTopicCommand, OracleRegistry> {
  private readonly logger = new Logger(UpdateProjectTopicCommandHandler.name)

  constructor(
    @Inject("OracleRegistryRepository")
    private readonly repository: OracleRegistryRepository,
  ) {}

  @Validate()
  async execute(command: UpdateProjectTopicCommand): Promise<OracleRegistry> {
    this.logger.log(`Updating topic for project ${command.projectId} in registry ${command.registryId}`)

    const registry = await this.repository.findById(command.registryId)
    if (!registry) {
      throw OracleRegistryNotFoundError.idError(command.registryId)
    }

    registry.updateProjectTopic(command.projectId, command.newTopicId)

    const updated = await this.repository.save(registry)

    this.logger.log(`Topic updated for project ${command.projectId} to ${command.newTopicId}`)

    return updated
  }
}
