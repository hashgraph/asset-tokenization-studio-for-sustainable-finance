// SPDX-License-Identifier: Apache-2.0

import { EntityFoundError } from "@hashgraph/green-bonds-shared-core"

export class OracleRegistryFoundError extends EntityFoundError {
  static kpiContractIdError(kpiContractId: string): OracleRegistryFoundError {
    return new OracleRegistryFoundError(`Oracle registry with KPI contract id ${kpiContractId} already exists.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
