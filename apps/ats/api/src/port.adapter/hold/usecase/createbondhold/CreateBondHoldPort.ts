// SPDX-License-Identifier: Apache-2.0

import { HeldByPartitionDLTEvent } from "./model/HeldByPartitionDLTEvent"

export interface CreateBondHoldPort {
  handle(event: HeldByPartitionDLTEvent): Promise<void>
}
