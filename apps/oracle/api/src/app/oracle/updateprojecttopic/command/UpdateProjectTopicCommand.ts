// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry"

export class UpdateProjectTopicCommand extends Command<OracleRegistry> {
  @IsNotEmpty()
  @IsString()
  registryId: string

  @IsNotEmpty()
  @IsString()
  projectId: string

  @IsNotEmpty()
  @IsString()
  newTopicId: string

  constructor(registryId: string, projectId: string, newTopicId: string) {
    super()
    this.registryId = registryId
    this.projectId = projectId
    this.newTopicId = newTopicId
  }
}
