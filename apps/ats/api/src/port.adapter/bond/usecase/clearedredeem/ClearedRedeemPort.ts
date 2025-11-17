// SPDX-License-Identifier: Apache-2.0
import { ClearedRedeemFromByPartitionDLTEvent } from "./model/ClearedRedeemFromByPartitionDLTEvent"

export interface ClearedRedeemPort {
  handle(event: ClearedRedeemFromByPartitionDLTEvent): Promise<void>
}
