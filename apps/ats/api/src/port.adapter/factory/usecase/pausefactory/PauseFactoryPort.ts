// SPDX-License-Identifier: Apache-2.0

import { TokenPausedDLTEvent } from "@hashgraph/green-bonds-shared-core"

export interface PauseFactoryPort {
  handle(event: TokenPausedDLTEvent): Promise<void>
}
