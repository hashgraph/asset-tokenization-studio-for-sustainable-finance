// SPDX-License-Identifier: Apache-2.0

import { Event } from "./Event"

export interface EventBus {
  publish<E extends Event>(event: E): void

  publishSync<E extends Event>(event: E, eventName?: string): Promise<void>
}
