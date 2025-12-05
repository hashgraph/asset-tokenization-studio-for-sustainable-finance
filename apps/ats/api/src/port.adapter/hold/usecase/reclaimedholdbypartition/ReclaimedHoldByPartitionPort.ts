// SPDX-License-Identifier: Apache-2.0
import { HoldByPartitionReclaimedDLTEvent } from "./model/HoldByPartitionReclaimedDLTEvent"

export interface ReclaimedHoldByPartitionPort {
  handle(event: HoldByPartitionReclaimedDLTEvent): Promise<void>
}
