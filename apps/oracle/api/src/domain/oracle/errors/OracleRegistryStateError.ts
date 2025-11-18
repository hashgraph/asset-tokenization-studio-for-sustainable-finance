// SPDX-License-Identifier: Apache-2.0

import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class OracleRegistryStateError extends DomainError {
  static cannotPauseStoppedRegistry(): OracleRegistryStateError {
    return new OracleRegistryStateError("Cannot pause a stopped oracle registry")
  }

  static cannotResumeStoppedRegistry(): OracleRegistryStateError {
    return new OracleRegistryStateError("Cannot resume a stopped oracle registry")
  }

  static atLeastOneProjectRequired(): OracleRegistryStateError {
    return new OracleRegistryStateError("At least one project is required")
  }

  protected constructor(message: string) {
    super(message)
  }
}
