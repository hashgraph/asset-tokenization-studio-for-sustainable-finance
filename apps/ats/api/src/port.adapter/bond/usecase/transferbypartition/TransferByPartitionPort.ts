// SPDX-License-Identifier: Apache-2.0
import { TransferByPartitionDLTEvent } from "./model/TransferByPartitionDLTEvent"

export interface TransferByPartitionPort {
  handle(event: TransferByPartitionDLTEvent): Promise<void>
}
