// SPDX-License-Identifier: Apache-2.0

import { Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { QueryHandler, PageOptionsRequest, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { GetEnvironmentalAssetHoldingsQuery } from "./GetEnvironmentalAssetHoldingsQuery"
import { EnvironmentalAssetHoldingsQueryResponse } from "./EnvironmentalAssetHoldingsQueryResponse"
import type { HederaPort } from "@port/blockchain/HederaPort"
import { CheckEnvironmentalAssetExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetExistsDomainService"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"

@Singleton()
@Handler(GetEnvironmentalAssetHoldingsQuery)
export class GetEnvironmentalAssetHoldingsQueryHandler
  implements
    QueryHandler<GetEnvironmentalAssetHoldingsQuery, QueryPageResponse<EnvironmentalAssetHoldingsQueryResponse>>
{
  constructor(
    @Inject("HederaPort") private readonly hederaPort: HederaPort,
    private readonly checkEnvironmentalAssetExists: CheckEnvironmentalAssetExistsDomainService,
    private readonly checkTreasuryExists: CheckTreasuryExistsDomainService,
  ) {}

  @Validate()
  async execute(
    query: GetEnvironmentalAssetHoldingsQuery,
  ): Promise<QueryPageResponse<EnvironmentalAssetHoldingsQueryResponse>> {
    const treasury = await this.checkTreasuryExists.execute(query.treasuryContractId)
    const environmentalAsset = await this.checkEnvironmentalAssetExists.execute(query.assetContractId, treasury.id)

    const pageOptionsRequest = new PageOptionsRequest()
    pageOptionsRequest.page = query.pageOptions.page
    pageOptionsRequest.limit = query.pageOptions.limit
    pageOptionsRequest.orderBy = query.pageOptions.order?.orderBy ?? "createdAt"
    pageOptionsRequest.order = query.pageOptions.order?.order ?? "DESC"

    const page = await this.hederaPort.getNFTs(environmentalAsset.id, query.treasuryContractId, pageOptionsRequest)

    return QueryPageResponse.fromPage(page, (nft: any) => ({
      createdTimestamp: nft.created_timestamp,
      delegatingSpender: nft.delegating_spender,
      deleted: nft.deleted,
      metadata: nft.metadata,
      modifiedTimestamp: nft.modified_timestamp,
      serialNumber: nft.serial_number,
      spenderId: nft.spender_id,
    }))
  }
}
