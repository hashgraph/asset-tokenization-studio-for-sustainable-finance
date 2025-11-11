// SPDX-License-Identifier: Apache-2.0

import { Event } from "@event/Event"

export class RoleRenouncedEvent extends Event {
  constructor(
    readonly userAccountId: string,
    readonly roleId: string,
    readonly contractId: string,
  ) {
    super()
  }
}
