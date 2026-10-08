// SPDX-License-Identifier: Apache-2.0

import { HealthIndicatorResult, HealthIndicatorService } from "@nestjs/terminus"
import type { SyncStateRepository } from "@domain/syncstate/repositories/SyncStateRepository"
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"

@Singleton()
export class BlockchainListenerHealthIndicator {
  constructor(
    @Inject() private readonly syncStateRepository: SyncStateRepository,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key)
    const syncState = await this.syncStateRepository.get()
    const { thirtySecondsAgoDate } = (
      await (this.syncStateRepository as any)
        .getRepository()
        .manager.query("SELECT now() at time zone 'utc' - INTERVAL '30 seconds' as \"thirtySecondsAgoDate\"")
    )[0]
    const details = { lastProcessedBlockNumber: syncState?.lastBlockNumber }
    // Set indicator to down if sync state has not been updated in 30 seconds, that means that blocks are not being processed due to an error
    if (!syncState || (syncState.updatedAt ?? syncState.createdAt) < thirtySecondsAgoDate) {
      return indicator.down(details)
    }
    return indicator.up(details)
  }
}
