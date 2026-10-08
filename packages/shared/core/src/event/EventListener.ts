// SPDX-License-Identifier: Apache-2.0

import { Event } from "./Event"

export interface EventListener<E extends Event> {
  handle(event: E)
}
