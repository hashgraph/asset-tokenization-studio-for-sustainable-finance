// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"

import { TransferEnvironmentalAssetTransactionRequest } from "./model/TransferEnvironmentalAssetTransactionRequest"
import { TransferEnvironmentalAssetTransactionAppService } from "@app/transaction/transferenvironmentalasset/service/TransferEnvironmentalAssetTransactionAppService"
import { TransferEnvironmentalAssetTransactionAppServiceRequest } from "@app/transaction/transferenvironmentalasset/service/model/TransferEnvironmentalAssetTransactionAppServiceRequest"
import { TransferEnvironmentalAssetTransactionPort } from "@port/transaction/usecase/transferenvironmentalasset/TransferEnvironmentalAssetTransactionPort"

@RestController("treasuries")
export class TransferEnvironmentalAssetTransactionHttpAdapter implements TransferEnvironmentalAssetTransactionPort {
  constructor(
    private readonly transferEnvironmentalAssetTransactionAppService: TransferEnvironmentalAssetTransactionAppService,
  ) {}

  @Post(":treasuryContractId/environmental-assets/:assetContractId/transfer")
  async transferEnvironmentalAsset(
    @Param("treasuryContractId") treasuryContractId: string,
    @Param("assetContractId") assetContractId: string,
    @Body() request: TransferEnvironmentalAssetTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.transferEnvironmentalAssetTransactionAppService.execute(
      new TransferEnvironmentalAssetTransactionAppServiceRequest(
        assetContractId,
        request.format,
        request.accountId!,
        treasuryContractId,
        request.tokenId,
        request.to,
      ),
    )
  }
}
