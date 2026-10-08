// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Delete } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"

import { RemoveEnvironmentalAssetTransactionRequest } from "./model/RemoveEnvironmentalAssetTransactionRequest"
import { RemoveEnvironmentalAssetTransactionAppService } from "@app/transaction/removeenvironmentalasset/service/RemoveEnvironmentalAssetTransactionAppService"
import { RemoveEnvironmentalAssetTransactionAppServiceRequest } from "@app/transaction/removeenvironmentalasset/service/model/RemoveEnvironmentalAssetTransactionAppServiceRequest"
import { RemoveEnvironmentalAssetTransactionPort } from "@port/transaction/usecase/removeenvironmentalasset/RemoveEnvironmentalAssetTransactionPort"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class RemoveEnvironmentalAssetTransactionHttpAdapter implements RemoveEnvironmentalAssetTransactionPort {
  constructor(
    private readonly removeEnvironmentalAssetTransactionAppService: RemoveEnvironmentalAssetTransactionAppService,
  ) {}

  @ApiOperation({ summary: "Removes an environmental asset from the treasury" })
  @ApiResponse({ status: 200, description: "OK", type: TransactionResponse })
  @Delete(":treasuryId/environmental-assets/:assetId")
  async removeEnvironmentalAsset(
    @Param("treasuryId") treasuryContractId: string,
    @Param("assetId") assetContractId: string,
    @Body() request: RemoveEnvironmentalAssetTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.removeEnvironmentalAssetTransactionAppService.execute(
      new RemoveEnvironmentalAssetTransactionAppServiceRequest(
        assetContractId,
        request.format,
        request.accountId!,
        treasuryContractId,
      ),
    )
  }
}
