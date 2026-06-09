// SPDX-License-Identifier: Apache-2.0
import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class BondKpiDataNotFoundError extends EntityNotFoundError {
  static kpiDataIdError(bondContractId: string, id: string): BondKpiDataNotFoundError {
    return new BondKpiDataNotFoundError(`KPI data point with id ${id} not found for bond ${bondContractId}.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
