// SPDX-License-Identifier: Apache-2.0
import { SyncState } from "@domain/syncstate/model/SyncState"

export interface SyncStateRepository {
  create(item: SyncState): Promise<SyncState>
  get(): Promise<SyncState | undefined>
}
