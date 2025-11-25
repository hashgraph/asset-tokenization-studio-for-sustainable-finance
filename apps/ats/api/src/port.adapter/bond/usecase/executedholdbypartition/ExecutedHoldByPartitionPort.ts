// SPDX-License-Identifier: Apache-2.0
import { HoldByPartitionExecutedDLTEvent } from "./model/HoldByPartitionExecutedDLTEvent"

export interface ExecutedHoldByPartitionPort {
  handle(event: HoldByPartitionExecutedDLTEvent): Promise<void>
}
