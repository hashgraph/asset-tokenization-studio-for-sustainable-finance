// SPDX-License-Identifier: Apache-2.0

import { BaseRepository, DatabaseLockTimeoutError, Singleton } from "@hashgraph/green-bonds-shared-core"
import { IsNull, Not } from "typeorm"
import { SyncStatePersistence } from "@port/persistence/syncstate/model/SyncStatePersistence"
import { SyncStateRepository } from "@domain/syncstate/repositories/SyncStateRepository"
import { SyncState } from "@domain/syncstate/model/SyncState"

@Singleton()
export default class SyncStateTypeOrmRepository
  extends BaseRepository<SyncStatePersistence>
  implements SyncStateRepository
{
  constructor() {
    super(SyncStatePersistence)
  }

  async save(syncState: SyncState, transactionId?: string): Promise<SyncState> {
    return (await this.getRepository(transactionId).save(syncState as SyncStatePersistence)) as SyncState
  }

  async get(transactionId?: string): Promise<SyncState | undefined> {
    try {
      const queryOptions: any = {
        where: {
          id: Not(IsNull()),
        },
      }

      if (transactionId) {
        queryOptions.lock = {
          mode: "pessimistic_write",
        }
      }

      return (await this.getRepository(transactionId).findOne(queryOptions)) as SyncState
    } catch (error) {
      if (error?.code === DatabaseLockTimeoutError.ERROR_CODE) {
        throw new DatabaseLockTimeoutError(error.message)
      }
      throw error
    }
  }
}
