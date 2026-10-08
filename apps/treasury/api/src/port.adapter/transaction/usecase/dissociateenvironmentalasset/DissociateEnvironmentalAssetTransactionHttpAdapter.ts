// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { DissociateEnvironmentalAssetTransactionRequest } from "./model/DissociateEnvironmentalAssetTransactionRequest"
import { DissociateEnvironmentalAssetTransactionPort } from "./DissociateEnvironmentalAssetTransactionPort"
import { DissociateEnvironmentalAssetTransactionAppService as AppService } from "@app/transaction/dissociateenvironmentalasset/DissociateEnvironmentalAssetTransactionAppService"
import { DissociateEnvironmentalAssetTransactionAppServiceRequest } from "@app/transaction/dissociateenvironmentalasset/model/DissociateEnvironmentalAssetTransactionAppServiceRequest"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class DissociateEnvironmentalAssetTransactionHttpAdapter implements DissociateEnvironmentalAssetTransactionPort {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: "Dissociates a certain environmental asset from the treasury" })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post(":treasuryId/environmental-assets/:assetId/dissociate")
  async dissociateEnvironmentalAsset(
    @Param("treasuryId") treasuryContractId: string,
    @Param("assetId") assetContractId: string,
    @Body() request: DissociateEnvironmentalAssetTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.appService.execute(
      new DissociateEnvironmentalAssetTransactionAppServiceRequest(
        assetContractId,
        request.format,
        request.accountId || "",
        treasuryContractId,
      ),
    )
  }
}
