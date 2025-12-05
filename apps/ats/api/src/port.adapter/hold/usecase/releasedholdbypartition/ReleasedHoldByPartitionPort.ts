// SPDX-License-Identifier: Apache-2.0
import { HoldByPartitionReleasedDLTEvent } from "./model/HoldByPartitionReleasedDLTEvent"

export interface ReleasedHoldByPartitionPort {
  handle(event: HoldByPartitionReleasedDLTEvent): Promise<void>
}
