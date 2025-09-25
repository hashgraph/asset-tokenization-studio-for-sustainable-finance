// SPDX-License-Identifier: Apache-2.0
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { SyncState } from "@domain/syncstate/model/SyncState"
import { SetSyncStateCommand } from "./SetSyncStateCommand"
import type { SyncStateRepository } from "@domain/syncstate/repositories/SyncStateRepository"
import { SyncStateSetEvent } from "@domain/syncstate/events/SyncStateSetEvent"

@Singleton()
@Handler(SetSyncStateCommand)
export default class SetSyncStateCommandHandler implements CommandHandler<SetSyncStateCommand, void> {
  constructor(
    @Inject() private readonly eventBus: EventBus,
    @Inject() private readonly syncStateRepository: SyncStateRepository,
  ) {}

  @Validate()
  async execute(command: SetSyncStateCommand): Promise<void> {
    const syncState = new SyncState()
    syncState.lastBlockNumber = command.lastBlockNumber

    const persistedSyncState = await this.syncStateRepository.get()
    await this.syncStateRepository.create(persistedSyncState ? { ...syncState, id: persistedSyncState.id } : syncState)

    const event = new SyncStateSetEvent(command.lastBlockNumber)

    this.eventBus.publish(event)
  }
}
