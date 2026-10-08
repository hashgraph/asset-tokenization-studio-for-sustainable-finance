// SPDX-License-Identifier: Apache-2.0

import { RedemptionExecutedDLTEvent } from "@port/redemption/usecase/syncredemption/model/RedemptionExecutedDLTEvent"
import { RedemptionByAddressesExecutedDLTEvent } from "@port/redemption/usecase/syncredemption/model/RedemptionByAddressesExecutedDLTEvent"

export interface SyncRedemptionPort {
  handleRedemptionExecuted(event: RedemptionExecutedDLTEvent): Promise<void>
  handleRedemptionByAddressesExecuted(event: RedemptionByAddressesExecutedDLTEvent): Promise<void>
}
