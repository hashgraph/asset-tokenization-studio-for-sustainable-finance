// SPDX-License-Identifier: Apache-2.0
import { TaskStatus } from "@domain/oracle/model/TaskStatus";

export class GetExecutionHistoryQuery {
  constructor(
    public readonly registryId: string,
    public readonly projectId?: string,
    public readonly status?: TaskStatus,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
