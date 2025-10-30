// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { DissociateEnvironmentalAssetTransactionRequest } from "./model/DissociateEnvironmentalAssetTransactionRequest"
import { DissociateEnvironmentalAssetTransactionPort } from "./DissociateEnvironmentalAssetTransactionPort"
import { DissociateEnvironmentalAssetTransactionAppService as AppService } from "@app/transaction/dissociateenvironmentalasset/DissociateEnvironmentalAssetTransactionAppService"
import { DissociateEnvironmentalAssetTransactionAppServiceRequest } from "@app/transaction/dissociateenvironmentalasset/model/DissociateEnvironmentalAssetTransactionAppServiceRequest"

@RestController("treasuries")
export class DissociateEnvironmentalAssetTransactionHttpAdapter implements DissociateEnvironmentalAssetTransactionPort {
  constructor(private readonly appService: AppService) {}

  @Post(":treasuryContractId/environmental-assets/:assetContractId/dissociate")
  async dissociateEnvironmentalAsset(
    @Param("treasuryContractId") treasuryContractId: string,
    @Param("assetContractId") assetContractId: string,
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
