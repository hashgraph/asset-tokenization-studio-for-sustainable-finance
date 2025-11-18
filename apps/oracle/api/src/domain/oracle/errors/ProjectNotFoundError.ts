// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class ProjectNotFoundError extends EntityNotFoundError {
  static projectIdError(projectId: string, registryId: string): ProjectNotFoundError {
    return new ProjectNotFoundError(`Project ${projectId} not found in oracle registry ${registryId}.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
