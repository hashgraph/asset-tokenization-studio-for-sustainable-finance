// SPDX-License-Identifier: Apache-2.0

import {ClearedHoldByPartitionDLTEvent} from "@port/bond/usecase/clearedhold/model/ClearedHoldByPartitionDLTEvent";

export interface ClearedHoldPort {
  handle(event: ClearedHoldByPartitionDLTEvent): Promise<void>
}
