// SPDX-License-Identifier: Apache-2.0

import type { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export interface PublishEventPort {
  handle(event: DLTEvent): Promise<void>
}
