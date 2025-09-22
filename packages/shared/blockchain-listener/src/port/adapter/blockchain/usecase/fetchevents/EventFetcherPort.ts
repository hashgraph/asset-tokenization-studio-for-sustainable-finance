// SPDX-License-Identifier: Apache-2.0

import Event from "@domain/event/Event.js"

export default interface EventFetcherPort {
  fetchEvents(): Promise<Event[]>
}
