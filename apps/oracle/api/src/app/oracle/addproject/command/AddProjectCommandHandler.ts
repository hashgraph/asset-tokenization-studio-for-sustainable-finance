// SPDX-License-Identifier: Apache-2.0
import { Inject, Logger, NotFoundException } from "@nestjs/common"
import { CommandHandler, Handler, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { AddProjectCommand } from "./AddProjectCommand"
import type { OracleRegistryRepository } from "@domain/oracle/repositories/OracleRegistryRepository"
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry"
import { Project } from "@domain/oracle/model/Project"

@Singleton()
@Handler(AddProjectCommand)
export class AddProjectCommandHandler implements CommandHandler<AddProjectCommand, OracleRegistry> {
  private readonly logger = new Logger(AddProjectCommandHandler.name)

  constructor(
    @Inject("OracleRegistryRepository")
    private readonly repository: OracleRegistryRepository,
  ) {}

  @Validate()
  async execute(command: AddProjectCommand): Promise<OracleRegistry> {
    this.logger.log(`Adding project ${command.projectId} to oracle registry ${command.registryId}`)

    const registry = await this.repository.findById(command.registryId)
    if (!registry) {
      throw new NotFoundException(`Oracle registry ${command.registryId} not found`)
    }

    const project = new Project(command.projectId, command.topicId)
    registry.addProject(project)

    const updated = await this.repository.save(registry)

    this.logger.log(`Project ${command.projectId} added to registry ${command.registryId}`)

    return updated
  }
}
