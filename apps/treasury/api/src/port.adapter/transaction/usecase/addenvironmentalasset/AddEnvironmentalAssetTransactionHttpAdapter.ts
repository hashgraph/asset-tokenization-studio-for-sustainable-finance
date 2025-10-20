// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"

import { AddEnvironmentalAssetTransactionRequest } from "./model/AddEnvironmentalAssetTransactionRequest"
import { AddEnvironmentalAssetTransactionAppService } from "@app/transaction/addenvironmentalasset/service/AddEnvironmentalAssetTransactionAppService"
import { AddEnvironmentalAssetTransactionAppServiceRequest } from "@app/transaction/addenvironmentalasset/service/model/AddEnvironmentalAssetTransactionAppServiceRequest"
import { AddEnvironmentalAssetTransactionPort } from "@port/transaction/usecase/addenvironmentalasset/AddEnvironmentalAssetTransactionPort"

@RestController("treasuries")
export class AddEnvironmentalAssetTransactionHttpAdapter implements AddEnvironmentalAssetTransactionPort {
  constructor(
    private readonly addEnvironmentalAssetTransactionAppService: AddEnvironmentalAssetTransactionAppService,
  ) {}

  @Post(":treasuryContractId/environmental-assets/:assetContractId")
  addEnvironmentalAsset(
    @Param("treasuryContractId") treasuryContractId: string,
    @Param("assetContractId") assetContractId: string,
    @Body() request: AddEnvironmentalAssetTransactionRequest,
  ): TransactionResponse {
    return this.addEnvironmentalAssetTransactionAppService.execute(
      new AddEnvironmentalAssetTransactionAppServiceRequest(
        assetContractId,
        request.format,
        request.accountId!,
        treasuryContractId,
      ),
    )
  }
}
