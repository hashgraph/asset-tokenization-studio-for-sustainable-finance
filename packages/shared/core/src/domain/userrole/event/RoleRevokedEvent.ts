// SPDX-License-Identifier: Apache-2.0

import { Event } from "@event/Event"

export class RoleRevokedEvent extends Event {
  constructor(
    readonly userAccountId: string,
    readonly roleId: string,
    readonly contractId: string,
  ) {
    super()
  }
}
