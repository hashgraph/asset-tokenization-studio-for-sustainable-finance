// SPDX-License-Identifier: Apache-2.0
import { ClearedRedeemByPartitionDLTEvent } from "./model/ClearedRedeemByPartitionDLTEvent"

export interface ClearedRedeemPort {
  handle(event: ClearedRedeemByPartitionDLTEvent): Promise<void>
}
