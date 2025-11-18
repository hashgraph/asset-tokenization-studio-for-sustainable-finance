// SPDX-License-Identifier: Apache-2.0

import { EntityFoundError } from "@hashgraph/green-bonds-shared-core"

export class ProjectFoundError extends EntityFoundError {
  static projectIdError(projectId: string, registryId: string): ProjectFoundError {
    return new ProjectFoundError(`Project ${projectId} already exists in oracle registry ${registryId}.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
