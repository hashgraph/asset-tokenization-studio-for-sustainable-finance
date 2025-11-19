// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsOptional, IsEnum } from "class-validator"
import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { TaskStatus } from "@domain/oracle/model/TaskStatus"
import { ExecutionHistoryQueryResponse } from "./ExecutionHistoryQueryResponse"

export class GetExecutionHistoryQuery extends Query<QueryPageResponse<ExecutionHistoryQueryResponse>> {
  @IsNotEmpty()
  @IsString()
  registryId: string

  @IsOptional()
  @IsString()
  projectId?: string

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus

  constructor(
    registryId: string,
    public readonly pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT,
    projectId?: string,
    status?: TaskStatus,
  ) {
    super()
    this.registryId = registryId
    this.projectId = projectId
    this.status = status
  }
}
