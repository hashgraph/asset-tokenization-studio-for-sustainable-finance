// SPDX-License-Identifier: Apache-2.0

import type { CommandBus, QueryBus } from "@hashgraph/green-bonds-shared-core"
import { Event, Inject, Logger, Singleton } from "@hashgraph/green-bonds-shared-core"
import { GetBlockToProcessQuery } from "@app/block/getblocktoprocess/query/GetBlockToProcessQuery"
import type { HederaPort } from "@port/blockchain/HederaPort"
import type { ConfigService } from "@port/config/ConfigService"
import { GetEventFiltersQuery } from "@app/eventfilter/geteventfilters/query/GetEventFiltersQuery"
import { plainToInstance } from "class-transformer"
import { ContractEventRequest } from "@port/blockchain/model/ContractEventRequest"
import { ProcessEventCommand } from "@app/eventstore/processevent/command/ProcessEventCommand"
import { EventStoreStatus } from "@domain/eventstore/model/EventStoreStatus"
import { SetSyncStateCommand } from "@app/syncstate/setsyncstate/command/SetSyncStateCommand"
import { GetBlockToProcessQueryResponse } from "@app/block/getblocktoprocess/query/GetBlockToProcessQueryResponse"
import { GetEventFiltersQueryResponse } from "@app/eventfilter/geteventfilters/query/GetEventFiltersQueryResponse"
import { EventStoreCommandResponse } from "@app/eventstore/processevent/command/EventStoreCommandResponse"
import { GetBlockRequest } from "@port/blockchain/model/GetBlockRequest"

@Singleton()
export class ProcessBlocksAppService {
  private readonly logger: Logger = new Logger("Blockchain-Listener")

  constructor(
    @Inject() private readonly queryBus: QueryBus,
    @Inject() private readonly commandBus: CommandBus,
    @Inject() private readonly hederaPort: HederaPort,
    @Inject() private readonly configService: ConfigService,
  ) {}

  async execute(): Promise<void> {
    try {
      await this.processBlocks()
    } catch (error) {
      this.logger.error("Error processing blocks. Block processing stopped. Please check error and restart.", error)
    }
  }

  private async delay() {
    return new Promise((resolve) => setTimeout(resolve, this.configService.getPollInternal()))
  }

  private async processBlocks() {
    const blockToProcess: GetBlockToProcessQueryResponse = await this.queryBus.execute(new GetBlockToProcessQuery())
    const eventFilters: GetEventFiltersQueryResponse[] = await this.queryBus.execute(new GetEventFiltersQuery())
    const contractEvents = eventFilters.map((eventFilter) => {
      return {
        contractAddress: eventFilter.contractAddress,
        eventSignature: eventFilter.eventSignature,
      } as ContractEventRequest
    })
    let blockNumber = blockToProcess.blockNumber
    this.logger.log(`Starting block processing from block ${blockNumber}`)
    while (true) {
      this.logger.debug(`Processing block ${blockNumber}`)
      const block = await this.hederaPort.getBlock(plainToInstance(GetBlockRequest, { blockNumber }))
      if (!block) {
        await this.delay()
        continue
      }
      const events = await this.hederaPort.fetchEvents({
        blockNumber,
        logsBloom: block.logsBloom,
        contractEvents,
      })
      for (const event of events) {
        this.logger.log(`Processing event ${event.name} from block ${blockNumber}`)
        const eventStore: EventStoreCommandResponse = await this.commandBus.execute(
          new ProcessEventCommand(event as Event),
        )
        if (eventStore.status === <string>EventStoreStatus.FAILED) {
          this.logger.error(
            `Error processing event ${event.name} in block ${blockNumber}: ${eventStore.errorReason}. Block processing stopped. Please check error and restart.`,
          )
          return
        }
      }
      await this.commandBus.execute(new SetSyncStateCommand(blockNumber))
      blockNumber++
    }
  }
}
