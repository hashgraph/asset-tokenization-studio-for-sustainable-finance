// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Delete } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"

import { RemoveEnvironmentalAssetTransactionRequest } from "./model/RemoveEnvironmentalAssetTransactionRequest"
import { RemoveEnvironmentalAssetTransactionAppService } from "@app/transaction/removeenvironmentalasset/service/RemoveEnvironmentalAssetTransactionAppService"
import { RemoveEnvironmentalAssetTransactionAppServiceRequest } from "@app/transaction/removeenvironmentalasset/service/model/RemoveEnvironmentalAssetTransactionAppServiceRequest"
import { RemoveEnvironmentalAssetTransactionPort } from "@port/transaction/usecase/removeenvironmentalasset/RemoveEnvironmentalAssetTransactionPort"

@RestController()
export class RemoveEnvironmentalAssetTransactionHttpAdapter implements RemoveEnvironmentalAssetTransactionPort {
  constructor(
    private readonly removeEnvironmentalAssetTransactionAppService: RemoveEnvironmentalAssetTransactionAppService,
  ) {}

  @Delete(":treasuryContractId/environmental-assets/:assetContractId")
  removeEnvironmentalAsset(
    @Param("treasuryContractId") treasuryContractId: string,
    @Param("assetContractId") assetContractId: string,
    @Body() request: RemoveEnvironmentalAssetTransactionRequest,
  ): TransactionResponse {
    return this.removeEnvironmentalAssetTransactionAppService.execute(
      new RemoveEnvironmentalAssetTransactionAppServiceRequest(
        assetContractId,
        request.format,
        request.accountId!,
        treasuryContractId,
      ),
    )
  }
}
