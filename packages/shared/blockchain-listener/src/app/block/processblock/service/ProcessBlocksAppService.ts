// SPDX-License-Identifier: Apache-2.0

import type { CommandBus, QueryBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { DatabaseLockTimeoutError, Event, Inject, Logger, Singleton } from "@hashgraph/green-bonds-shared-core"
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
import { SyncStateStatus } from "@domain/syncstate/model/SyncStateStatus"

@Singleton()
export class ProcessBlocksAppService {
  private readonly logger: Logger = new Logger("Blockchain-Listener")
  private blockNumber: number = undefined

  constructor(
    @Inject() private readonly queryBus: QueryBus,
    @Inject() private readonly commandBus: CommandBus,
    @Inject() private readonly hederaPort: HederaPort,
    @Inject() private readonly configService: ConfigService,
    @Inject() private readonly transactionManager: TransactionManager,
  ) {}

  async execute(): Promise<void> {
    try {
      await this.processBlocks()
    } catch (error) {
      if (error instanceof DatabaseLockTimeoutError) {
        this.logger.warn("Database lock timeout, retrying block processing")
        return await this.execute()
      }
      this.logger.error("Error processing blocks. Block processing stopped. Please check error and restart.", error)
    }
  }

  private async delay() {
    return new Promise((resolve) => setTimeout(resolve, this.configService.getPollInternal()))
  }

  private async processBlocks() {
    let exit = false
    while (!exit) {
      await this.transactionManager.execute(async (transactionId) => {
        const blockToProcess: GetBlockToProcessQueryResponse = await this.queryBus.execute(
          new GetBlockToProcessQuery(transactionId),
        )
        // Do not take into account failed status if it is first time after boot (blockNumber === undefined)
        if (blockToProcess.syncStateStatus === <string>SyncStateStatus.FAILED && this.blockNumber !== undefined) {
          this.logger.error(
            `Should stop processing events because another instance has failed. Please check error and restart.`,
          )
          exit = true
          return
        }
        if (this.blockNumber === undefined) {
          this.logger.log(`Starting block processing from block ${blockToProcess.blockNumber}`)
        }
        this.blockNumber = blockToProcess.blockNumber
        const block = await this.hederaPort.getBlock(
          plainToInstance(GetBlockRequest, { blockNumber: this.blockNumber }),
        )
        if (!block) {
          await this.delay()
          return
        }
        this.logger.debug(`Processing block ${this.blockNumber}`)
        const eventFilters: GetEventFiltersQueryResponse[] = await this.queryBus.execute(new GetEventFiltersQuery())
        const contractEvents = eventFilters.map((eventFilter) => {
          return {
            contractAddress: eventFilter.contractAddress,
            eventSignature: eventFilter.eventSignature,
          } as ContractEventRequest
        })
        const events = await this.hederaPort.fetchEvents({
          blockNumber: this.blockNumber,
          logsBloom: block.logsBloom,
          contractEvents,
        })
        for (const event of events) {
          this.logger.log(`Processing event ${event.name} from block ${this.blockNumber}`)
          const eventStore: EventStoreCommandResponse = await this.commandBus.execute(
            new ProcessEventCommand(event as Event, transactionId),
          )
          if (eventStore.status === <string>EventStoreStatus.FAILED) {
            await this.commandBus.execute(new SetSyncStateCommand(transactionId, <string>SyncStateStatus.FAILED))
            this.logger.error(
              `Error processing event ${event.name} in block ${this.blockNumber}: ${eventStore.errorReason}. Block processing stopped. Please check error and restart.`,
            )
            exit = true
            return
          }
        }
        await this.commandBus.execute(
          new SetSyncStateCommand(transactionId, <string>SyncStateStatus.OK, this.blockNumber),
        )
      })
    }
  }
}
