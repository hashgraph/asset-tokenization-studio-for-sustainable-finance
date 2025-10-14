// SPDX-License-Identifier: Apache-2.0

import { Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { QueryHandler, QueryPageRequest, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import type { EnvironmentalAssetRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetRepository"
import type { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"
import { EnvironmentalAssetNotFoundError } from "@domain/environmentalasset/errors/EnvironmentalAssetNotFoundError"
import { GetEnvironmentalAssetHoldingsQuery } from "./GetEnvironmentalAssetHoldingsQuery"
import { EnvironmentalAssetHoldingsQueryResponse } from "./EnvironmentalAssetHoldingsQueryResponse"
import type { HederaPort } from "@port/blockchain/HederaPort"

@Singleton()
@Handler(GetEnvironmentalAssetHoldingsQuery)
export class GetEnvironmentalAssetHoldingsQueryHandler
  implements
    QueryHandler<GetEnvironmentalAssetHoldingsQuery, QueryPageResponse<EnvironmentalAssetHoldingsQueryResponse>>
{
  constructor(
    @Inject("EnvironmentalAssetRepository") private readonly environmentalAssetRepository: EnvironmentalAssetRepository,
    @Inject("TreasuryRepository") private readonly treasuryRepository: TreasuryRepository,
    @Inject("HederaPort") private readonly hederaPort: HederaPort,
  ) {}

  @Validate()
  async execute(
    query: GetEnvironmentalAssetHoldingsQuery,
  ): Promise<QueryPageResponse<EnvironmentalAssetHoldingsQueryResponse>> {
    const treasury = await this.treasuryRepository.findByContractId(query.treasuryContractId)
    if (!treasury) {
      throw TreasuryNotFoundError.contractIdError(query.treasuryContractId)
    }

    const environmentalAsset = await this.environmentalAssetRepository.findByContractIdAndTreasuryId(
      query.assetContractId,
      treasury.id,
    )
    if (!environmentalAsset) {
      throw EnvironmentalAssetNotFoundError.idError(query.assetContractId)
    }

    const queryPageRequest = new QueryPageRequest()
    queryPageRequest.page = query.pageOptions.page
    queryPageRequest.limit = query.pageOptions.limit
    queryPageRequest.orderBy = query.pageOptions.order?.orderBy ?? "createdAt"
    queryPageRequest.order = query.pageOptions.order?.order ?? "DESC"

    const page = await this.hederaPort.getNFTs(query.assetContractId, query.treasuryContractId, queryPageRequest)

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
