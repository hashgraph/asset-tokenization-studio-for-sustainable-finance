// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class OracleRegistryNotFoundError extends EntityNotFoundError {
  static idError(id: string): OracleRegistryNotFoundError {
    return new OracleRegistryNotFoundError(`Oracle registry with id ${id} not found.`)
  }

  static kpiContractIdError(kpiContractId: string): OracleRegistryNotFoundError {
    return new OracleRegistryNotFoundError(`Oracle registry with KPI contract id ${kpiContractId} not found.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
