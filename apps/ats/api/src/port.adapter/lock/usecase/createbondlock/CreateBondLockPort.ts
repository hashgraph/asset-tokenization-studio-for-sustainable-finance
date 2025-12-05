// SPDX-License-Identifier: Apache-2.0
import { LockedByPartitionDLTEvent } from "./model/LockedByPartitionDLTEvent"

export interface CreateBondLockPort {
  handle(event: LockedByPartitionDLTEvent): Promise<void>
}
