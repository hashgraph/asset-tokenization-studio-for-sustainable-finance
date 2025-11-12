// SPDX-License-Identifier: Apache-2.0

import type { Event } from "@hashgraph/green-bonds-shared-core"

export interface EventPublisherPort {
  publish(event: Event): Promise<void>
}

