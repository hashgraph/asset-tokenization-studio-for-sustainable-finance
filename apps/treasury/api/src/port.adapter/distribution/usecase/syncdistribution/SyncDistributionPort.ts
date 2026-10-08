// SPDX-License-Identifier: Apache-2.0

import { DistributionExecutedDLTEvent } from "@port/distribution/usecase/syncdistribution/model/DistributionExecutedDLTEvent"
import { DistributionByAddressesExecutedDLTEvent } from "@port/distribution/usecase/syncdistribution/model/DistributionByAddressesExecutedDLTEvent"

export interface SyncDistributionPort {
  handleDistributionExecuted(event: DistributionExecutedDLTEvent): Promise<void>
  handleDistributionByAddressesExecuted(event: DistributionByAddressesExecutedDLTEvent): Promise<void>
}
