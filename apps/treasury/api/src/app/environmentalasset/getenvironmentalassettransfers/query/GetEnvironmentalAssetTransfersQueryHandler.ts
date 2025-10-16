// SPDX-License-Identifier: Apache-2.0

import { Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { QueryHandler, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import type { EnvironmentalAssetTransferRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetTransferRepository"
import type { EnvironmentalAssetRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetRepository"
import { EnvironmentalAssetNotFoundError } from "@domain/environmentalasset/errors/EnvironmentalAssetNotFoundError"
import { GetEnvironmentalAssetTransfersQuery } from "./GetEnvironmentalAssetTransfersQuery"
import { EnvironmentalAssetTransferQueryResponse } from "./EnvironmentalAssetTransferQueryResponse"
import { EnvironmentalAssetTransfer } from "@domain/environmentalasset/model/EnvironmentalAssetTransfer"

@Singleton()
@Handler(GetEnvironmentalAssetTransfersQuery)
export class GetEnvironmentalAssetTransfersQueryHandler
  implements
    QueryHandler<GetEnvironmentalAssetTransfersQuery, QueryPageResponse<EnvironmentalAssetTransferQueryResponse>>
{
  constructor(
    @Inject()
    private readonly environmentalAssetTransferRepository: EnvironmentalAssetTransferRepository,
    @Inject()
    private readonly environmentalAssetRepository: EnvironmentalAssetRepository,
  ) {}

  @Validate()
  async execute(
    query: GetEnvironmentalAssetTransfersQuery,
  ): Promise<QueryPageResponse<EnvironmentalAssetTransferQueryResponse>> {
    const environmentalAsset = await this.environmentalAssetRepository.findByContractId(
      query.environmentalAssetContractId,
    )
    if (!environmentalAsset) {
      throw EnvironmentalAssetNotFoundError.contractIdError(query.environmentalAssetContractId)
    }

    const page = await this.environmentalAssetTransferRepository.findByEnvironmentalAssetId(
      environmentalAsset.id,
      query.pageOptions.toPageOptions(),
    )

    return QueryPageResponse.fromPage(page, (transfer: EnvironmentalAssetTransfer) => ({
      accountId: transfer.accountId,
      tokenId: transfer.tokenId,
      type: transfer.type,
      transferDate: transfer.createdAt,
    }))
  }
}
