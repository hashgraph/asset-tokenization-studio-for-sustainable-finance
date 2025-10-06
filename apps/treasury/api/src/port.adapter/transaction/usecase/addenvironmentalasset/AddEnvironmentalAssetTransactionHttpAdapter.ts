// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"

import { AddEnvironmentalAssetTransactionRequest } from "./model/AddEnvironmentalAssetTransactionRequest"
import { AddEnvironmentalAssetTransactionAppService } from "@app/transaction/addenvironmentalasset/service/AddEnvironmentalAssetTransactionAppService"
import { AddEnvironmentalAssetTransactionAppServiceRequest } from "@app/transaction/addenvironmentalasset/service/model/AddEnvironmentalAssetTransactionAppServiceRequest"
import { AddEnvironmentalAssetTransactionPort } from "@port/transaction/usecase/addenvironmentalasset/AddEnvironmentalAssetTransactionPort"

@RestController()
export class AddEnvironmentalAssetTransactionHttpAdapter implements AddEnvironmentalAssetTransactionPort {
  constructor(
    private readonly addEnvironmentalAssetTransactionAppService: AddEnvironmentalAssetTransactionAppService,
  ) {}

  @Post(":treasuryId/environmental-assets/:assetId")
  addEnvironmentalAsset(
    @Param("treasuryId") treasuryId: string,
    @Param("assetId") assetId: string,
    @Body() request: AddEnvironmentalAssetTransactionRequest,
  ): TransactionResponse {
    return this.addEnvironmentalAssetTransactionAppService.execute(
      new AddEnvironmentalAssetTransactionAppServiceRequest(assetId, request.format, request.accountId!, treasuryId),
    )
  }
}
