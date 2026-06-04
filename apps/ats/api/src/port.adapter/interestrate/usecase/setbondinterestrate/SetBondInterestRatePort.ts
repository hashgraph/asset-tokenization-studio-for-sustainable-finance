// SPDX-License-Identifier: Apache-2.0
import { InterestRateUpdatedDLTEvent } from "@port/interestrate/usecase/setbondinterestrate/model/InterestRateUpdatedDLTEvent"

export interface SetBondInterestRatePort {
  handle(event: InterestRateUpdatedDLTEvent): Promise<void>
}
