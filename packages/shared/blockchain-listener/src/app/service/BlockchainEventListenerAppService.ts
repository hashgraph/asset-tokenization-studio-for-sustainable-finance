// SPDX-License-Identifier: Apache-2.0

import { Singleton, Logger, Inject } from "@hashgraph/green-bonds-shared-core"
import type EventListenerPort from "@port/listener/usecase/listenevents/EventListenerPort"

@Singleton()
export default class BlockchainEventListenerAppService {
  private readonly logger = new Logger(BlockchainEventListenerAppService.name)

  constructor(@Inject() private readonly eventListener: EventListenerPort) {}

  async start() {
    this.logger.log("Starting blockchain event listener...")
    this.eventListener.subscribe((event) => {
      this.logger.log(`Event received: ${JSON.stringify(event)}`)
      // TODO: For every received event, once it is decoded, it must persist it
    })
  }

  async stop() {
    this.logger.log("Stopping blockchain event listener...")
    this.eventListener.unsubscribe?.()
  }
}
