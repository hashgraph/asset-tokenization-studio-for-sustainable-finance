// SPDX-License-Identifier: Apache-2.0

import { Handler, Inject, QueryHandler, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { GetBlockToProcessQuery } from "@app/block/getblocktoprocess/query/GetBlockToProcessQuery"
import { GetBlockToProcessQueryResponse } from "@app/block/getblocktoprocess/query/GetBlockToProcessQueryResponse"
import type { SyncStateRepository } from "@domain/syncstate/repositories/SyncStateRepository"
import type { ConfigService } from "@port/config/ConfigService"
import type { HederaPort } from "@port/blockchain/HederaPort"

@Singleton()
@Handler(GetBlockToProcessQuery)
export class GetBlockToProcessQueryHandler
  implements QueryHandler<GetBlockToProcessQuery, GetBlockToProcessQueryResponse>
{
  constructor(
    @Inject() private readonly syncStateRepository: SyncStateRepository,
    @Inject() private readonly configService: ConfigService,
    @Inject() private readonly hederaPort: HederaPort,
  ) {}

  @Validate()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(query: GetBlockToProcessQuery): Promise<GetBlockToProcessQueryResponse> {
    let syncBlock = (await this.syncStateRepository.get())?.lastBlockNumber
    syncBlock = syncBlock ? syncBlock + 1 : null
    const configuredBlock = this.configService.getBlockNumber()
    const blockToProcess = configuredBlock && (!syncBlock || configuredBlock > syncBlock) ? configuredBlock : syncBlock

    return {
      blockNumber: blockToProcess ?? (await this.hederaPort.getLastBlockNumber()),
    }
  }
}
