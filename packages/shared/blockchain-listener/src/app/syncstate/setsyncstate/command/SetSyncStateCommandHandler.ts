// SPDX-License-Identifier: Apache-2.0
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { SyncState } from "@domain/syncstate/model/SyncState"
import { SetSyncStateCommand } from "./SetSyncStateCommand"
import type { SyncStateRepository } from "@domain/syncstate/repositories/SyncStateRepository"
import { SyncStateSetEvent } from "@domain/syncstate/events/SyncStateSetEvent"
import { SyncStateStatus } from "@domain/syncstate/model/SyncStateStatus"

@Singleton()
@Handler(SetSyncStateCommand)
export default class SetSyncStateCommandHandler implements CommandHandler<SetSyncStateCommand, void> {
  constructor(
    @Inject() private readonly eventBus: EventBus,
    @Inject() private readonly syncStateRepository: SyncStateRepository,
  ) {}

  @Validate()
  async execute(command: SetSyncStateCommand): Promise<void> {
    const syncState = (await this.syncStateRepository.get(command.transactionId)) ?? new SyncState()
    syncState.status = <SyncStateStatus>command.status
    if (command.lastBlockNumber) {
      syncState.lastBlockNumber = command.lastBlockNumber
    }

    await this.syncStateRepository.save(syncState, command.transactionId)

    const event = new SyncStateSetEvent(command.lastBlockNumber, command.status)

    this.eventBus.publish(event)
  }
}
