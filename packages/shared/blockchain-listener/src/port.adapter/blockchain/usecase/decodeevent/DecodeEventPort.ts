// SPDX-License-Identifier: Apache-2.0

import BlockchainEvent from "@domain/event/BlockchainEvent.js"
import Log from "@domain/blockchain/Log.js"

export default interface DecodeEventPort {
  decode(log: Log): BlockchainEvent
}
