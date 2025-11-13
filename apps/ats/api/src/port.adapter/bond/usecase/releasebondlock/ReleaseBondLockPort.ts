// SPDX-License-Identifier: Apache-2.0
import { LockByPartitionReleasedDLTEvent } from "./model/LockByPartitionReleasedDLTEvent"

export interface ReleaseBondLockPort {
  handle(event: LockByPartitionReleasedDLTEvent): Promise<void>
}
