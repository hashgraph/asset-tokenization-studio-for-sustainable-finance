// SPDX-License-Identifier: Apache-2.0
import { Query } from "@hashgraph/green-bonds-shared-core"
import { SyncState } from "@domain/syncstate/model/SyncState"

export class GetSyncStateQuery extends Query<SyncState> {
  constructor() {
    super()
  }
}