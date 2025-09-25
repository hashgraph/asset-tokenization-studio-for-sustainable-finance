// SPDX-License-Identifier: Apache-2.0
import { QueryHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { SyncState } from "@domain/syncstate/model/SyncState"
import { GetSyncStateQuery } from "./GetSyncStateQuery"
import  type { SyncStateRepository } from "@domain/syncstate/repositories/SyncStateRepository"

@Singleton()
@Handler(GetSyncStateQuery)
export default class GetSyncStateQueryHandler implements QueryHandler<GetSyncStateQuery, void> {
  constructor(
    @Inject() private readonly syncStateRepository: SyncStateRepository
  ) {}

  @Validate()
  async execute(query: GetSyncStateQuery): Promise<SyncState> {
    return await this.syncStateRepository.get()
  }
}