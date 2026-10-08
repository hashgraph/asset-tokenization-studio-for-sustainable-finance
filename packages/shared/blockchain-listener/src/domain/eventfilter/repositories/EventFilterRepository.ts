// SPDX-License-Identifier: Apache-2.0

import { EventFilter } from "@domain/eventfilter/model/EventFilter"

export interface EventFilterRepository {
  saveAll(eventFilter: EventFilter[]): Promise<void>

  findAll(): Promise<EventFilter[]>
}
