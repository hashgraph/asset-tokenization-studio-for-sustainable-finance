// SPDX-License-Identifier: Apache-2.0
import { SyncState } from "@domain/syncstate/model/SyncState"

export interface SyncStateRepository {
  save(item: SyncState): Promise<SyncState>
  update(id: string, item: SyncState): Promise<SyncState>
  get(): Promise<SyncState | undefined>
}
