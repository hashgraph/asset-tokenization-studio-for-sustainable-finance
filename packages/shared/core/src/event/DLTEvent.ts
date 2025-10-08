// SPDX-License-Identifier: Apache-2.0

import { Event } from "./Event"

export class DLTEvent extends Event {
  readonly contractId: string
  readonly transactionHash: string
}
