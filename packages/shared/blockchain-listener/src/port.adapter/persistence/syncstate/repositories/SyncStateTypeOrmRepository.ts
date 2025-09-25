// SPDX-License-Identifier: Apache-2.0
import { Singleton, Logger } from "@hashgraph/green-bonds-shared-core"
import { SyncState } from "@domain/syncstate/model/SyncState"
import { SyncStateRepository } from "@domain/syncstate/repositories/SyncStateRepository"
import SyncStateNotFoundError from "@port/persistence/syncstate/repositories/error/SyncStateNotFoundError"
import { SyncStatePersistence } from "@port/persistence/syncstate/model/SyncStatePersistence"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"

@Singleton()
export default class SyncStateTypeOrmRepository implements SyncStateRepository {
  constructor(
    @InjectRepository(SyncStatePersistence)
    private readonly syncStateRepository: Repository<SyncStatePersistence>,
  ) {}

  async save(syncState: SyncState): Promise<SyncState> {
    const persistence = await this.syncStateRepository.save(syncState as SyncStatePersistence)
    return persistence as SyncState
  }

  async update(syncState: SyncState): Promise<SyncState> {
    let persistence: SyncStatePersistence
    try {
      const persistence = await this.syncStateRepository.update(syncState.id, syncState as SyncStatePersistence)
    } catch (error) {
      throw new SyncStateNotFoundError(syncState.id)
    }
    return persistence as SyncState
  }

  async get(): Promise<SyncState | undefined> {
    const persistence = await this.syncStateRepository.findOne({})
    return persistence ? persistence as SyncState : undefined
  }
}
