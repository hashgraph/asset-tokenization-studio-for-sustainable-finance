// SPDX-License-Identifier: Apache-2.0

import Event from "@domain/event/Event.js"
import Log from "@domain/blockchain/Log.js"

export default interface DecodeEventPort {
  decode(log: Log): Event
}