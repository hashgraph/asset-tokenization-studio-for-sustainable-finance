// SPDX-License-Identifier: Apache-2.0
import { BondInterestRateResponse } from "@port/interestrate/usecase/getbondinterestrate/model/BondInterestRateResponse"

export interface GetBondInterestRatePort {
  getBondInterestRate(bondContractId: string): Promise<BondInterestRateResponse>
}
