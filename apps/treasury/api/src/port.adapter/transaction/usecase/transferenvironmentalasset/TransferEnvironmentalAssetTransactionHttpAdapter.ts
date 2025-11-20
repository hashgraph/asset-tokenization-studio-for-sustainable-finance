// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"

import { TransferEnvironmentalAssetTransactionRequest } from "./model/TransferEnvironmentalAssetTransactionRequest"
import { TransferEnvironmentalAssetTransactionAppService } from "@app/transaction/transferenvironmentalasset/service/TransferEnvironmentalAssetTransactionAppService"
import { TransferEnvironmentalAssetTransactionAppServiceRequest } from "@app/transaction/transferenvironmentalasset/service/model/TransferEnvironmentalAssetTransactionAppServiceRequest"
import { TransferEnvironmentalAssetTransactionPort } from "@port/transaction/usecase/transferenvironmentalasset/TransferEnvironmentalAssetTransactionPort"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class TransferEnvironmentalAssetTransactionHttpAdapter implements TransferEnvironmentalAssetTransactionPort {
  constructor(
    private readonly transferEnvironmentalAssetTransactionAppService: TransferEnvironmentalAssetTransactionAppService,
  ) {}

  @ApiOperation({ summary: "Transfers environmental asset from treasury to a destination" })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post(":treasuryId/environmental-assets/:assetId/transfer")
  async transferEnvironmentalAsset(
    @Param("treasuryId") treasuryContractId: string,
    @Param("assetId") assetContractId: string,
    @Body() request: TransferEnvironmentalAssetTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.transferEnvironmentalAssetTransactionAppService.execute(
      new TransferEnvironmentalAssetTransactionAppServiceRequest(
        assetContractId,
        request.format,
        request.accountId!,
        treasuryContractId,
        request.tokenId,
        request.toAccountId,
      ),
    )
  }
}
