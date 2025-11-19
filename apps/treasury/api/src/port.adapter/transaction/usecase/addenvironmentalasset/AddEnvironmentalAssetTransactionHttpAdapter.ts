// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"

import { AddEnvironmentalAssetTransactionRequest } from "./model/AddEnvironmentalAssetTransactionRequest"
import { AddEnvironmentalAssetTransactionAppService } from "@app/transaction/addenvironmentalasset/service/AddEnvironmentalAssetTransactionAppService"
import { AddEnvironmentalAssetTransactionAppServiceRequest } from "@app/transaction/addenvironmentalasset/service/model/AddEnvironmentalAssetTransactionAppServiceRequest"
import { AddEnvironmentalAssetTransactionPort } from "@port/transaction/usecase/addenvironmentalasset/AddEnvironmentalAssetTransactionPort"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("treasuries")
export class AddEnvironmentalAssetTransactionHttpAdapter implements AddEnvironmentalAssetTransactionPort {
  constructor(
    private readonly addEnvironmentalAssetTransactionAppService: AddEnvironmentalAssetTransactionAppService,
  ) {}

  @ApiOperation({ summary: "Adds a new CC/CF to the treasury" })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post(":treasuryId/environmental-assets/:assetId")
  async addEnvironmentalAsset(
    @Param("treasuryId") treasuryContractId: string,
    @Param("assetId") assetContractId: string,
    @Body() request: AddEnvironmentalAssetTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.addEnvironmentalAssetTransactionAppService.execute(
      new AddEnvironmentalAssetTransactionAppServiceRequest(
        assetContractId,
        request.format,
        request.accountId!,
        treasuryContractId,
      ),
    )
  }
}
