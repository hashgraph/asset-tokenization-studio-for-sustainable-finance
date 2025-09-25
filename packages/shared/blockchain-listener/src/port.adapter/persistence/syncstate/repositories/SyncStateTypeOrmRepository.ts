// SPDX-License-Identifier: Apache-2.0

import { Singleton } from "@hashgraph/green-bonds-shared-core"
import { Repository, Not, IsNull } from "typeorm"
import { SyncStatePersistence } from "@port/persistence/syncstate/model/SyncStatePersistence"
import { InjectRepository } from "@nestjs/typeorm"
import { SyncStateRepository } from "@domain/syncstate/repositories/SyncStateRepository"
import { SyncState } from "@domain/syncstate/model/SyncState"

@Singleton()
export default class SyncStateTypeOrmRepository implements SyncStateRepository {
  constructor(
    @InjectRepository(SyncStatePersistence)
    private readonly syncStateRepository: Repository<SyncStatePersistence>,
  ) {}

  async save(syncState: SyncState): Promise<SyncState> {
    return (await this.syncStateRepository.save(syncState as SyncStatePersistence)) as SyncState
  }

  async get(): Promise<SyncState | undefined> {
    return (await this.syncStateRepository.findOne({
      where: {
        lastBlockNumber: Not(IsNull()),
      },
    })) as SyncState
  }
}
