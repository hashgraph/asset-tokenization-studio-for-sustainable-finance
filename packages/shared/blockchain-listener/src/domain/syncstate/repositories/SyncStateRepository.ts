// SPDX-License-Identifier: Apache-2.0
import { SyncState } from "@domain/syncstate/model/SyncState"

export interface SyncStateRepository {
  save(item: SyncState, transactionId?: string): Promise<SyncState>
  get(transactionId?: string): Promise<SyncState | undefined>
}
