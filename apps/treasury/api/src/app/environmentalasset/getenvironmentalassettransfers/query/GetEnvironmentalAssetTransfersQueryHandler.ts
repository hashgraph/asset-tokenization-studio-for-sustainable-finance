// SPDX-License-Identifier: Apache-2.0

import { Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { QueryHandler, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import type { EnvironmentalAssetTransferRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetTransferRepository"
import { CheckEnvironmentalAssetExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetExistsDomainService"
import { GetEnvironmentalAssetTransfersQuery } from "./GetEnvironmentalAssetTransfersQuery"
import { EnvironmentalAssetTransferQueryResponse } from "./EnvironmentalAssetTransferQueryResponse"
import { EnvironmentalAssetTransfer } from "@domain/environmentalasset/model/EnvironmentalAssetTransfer"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"

@Singleton()
@Handler(GetEnvironmentalAssetTransfersQuery)
export class GetEnvironmentalAssetTransfersQueryHandler
  implements
    QueryHandler<GetEnvironmentalAssetTransfersQuery, QueryPageResponse<EnvironmentalAssetTransferQueryResponse>>
{
  constructor(
    @Inject()
    private readonly environmentalAssetTransferRepository: EnvironmentalAssetTransferRepository,
    private readonly checkEnvironmentalAssetExistsDomainService: CheckEnvironmentalAssetExistsDomainService,
    private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService,
  ) {}

  @Validate()
  async execute(
    query: GetEnvironmentalAssetTransfersQuery,
  ): Promise<QueryPageResponse<EnvironmentalAssetTransferQueryResponse>> {
    const treasury = await this.checkTreasuryExistsDomainService.execute(query.treasuryContractId)

    const environmentalAsset = await this.checkEnvironmentalAssetExistsDomainService.execute(
      query.environmentalAssetContractId,
      treasury.id,
    )

    const page = await this.environmentalAssetTransferRepository.findByEnvironmentalAssetId(
      environmentalAsset.id,
      query.pageOptions.toPageOptions(),
      query.type,
    )

    return QueryPageResponse.fromPage(page, (transfer: EnvironmentalAssetTransfer) => ({
      accountId: transfer.accountId,
      tokenId: transfer.tokenId,
      type: transfer.type,
      transferDate: transfer.createdAt,
    }))
  }
}
