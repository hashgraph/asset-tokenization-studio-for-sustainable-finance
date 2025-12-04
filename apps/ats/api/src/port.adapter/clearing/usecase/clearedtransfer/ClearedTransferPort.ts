// SPDX-License-Identifier: Apache-2.0
import type { ClearedTransferByPartitionDLTEvent } from "./model/ClearedTransferByPartitionDLTEvent"

export interface ClearedTransferPort {
  handle(event: ClearedTransferByPartitionDLTEvent): Promise<void>
}
