// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export default class SyncStateNotFoundError extends EntityNotFoundError {
  static readonly MESSAGE = "Sync state not found"

  constructor(syncStateId?: string) {
    super(`SyncStateNotFoundError.MESSAGE: ${syncStateId}`)
  }
}
