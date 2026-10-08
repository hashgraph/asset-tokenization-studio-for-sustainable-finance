// SPDX-License-Identifier: Apache-2.0

import { TokenUnpausedDLTEvent } from "@hashgraph/green-bonds-shared-core"

export interface UnpauseBondPort {
  handle(event: TokenUnpausedDLTEvent): Promise<void>
}
