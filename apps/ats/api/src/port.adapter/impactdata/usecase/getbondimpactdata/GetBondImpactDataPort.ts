// SPDX-License-Identifier: Apache-2.0
import { BondImpactDataResponse } from "@port/impactdata/usecase/getbondimpactdata/model/BondImpactDataResponse"

export interface GetBondImpactDataPort {
  getBondImpactData(bondContractId: string): Promise<BondImpactDataResponse>
}
