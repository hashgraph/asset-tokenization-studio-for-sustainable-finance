// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { ExternalTransferEnvironmentalAssetTransactionRequest } from "@port/transaction/usecase/externaltransferenvironmentalasset/model/ExternalTransferEnvironmentalAssetTransactionRequest"
import { ExternalTransferEnvironmentalAssetTransactionPort } from "@port/transaction/usecase/externaltransferenvironmentalasset/ExternalTransferEnvironmentalAssetTransactionPort"
import { ExternalTransferEnvironmentalAssetTransactionAppService } from "@app/transaction/externaltransferenvironmentalasset/service/service/ExternalTransferEnvironmentalAssetTransactionAppService"
import { ExternalTransferEnvironmentalAssetTransactionAppServiceRequest } from "@app/transaction/externaltransferenvironmentalasset/service/service/model/ExternalTransferEnvironmentalAssetTransactionAppServiceRequest"

@RestController("environmental-assets")
export class ExternalTransferEnvironmentalAssetTransactionHttpAdapter
  implements ExternalTransferEnvironmentalAssetTransactionPort
{
  constructor(private readonly appService: ExternalTransferEnvironmentalAssetTransactionAppService) {}

  @Post(":environmentalAssetContractId/treasuries/:treasuryContractId/transfer")
  externalTransferEnvironmentalAsset(
    @Param("environmentalAssetContractId") environmentalAssetContractId: string,
    @Param("treasuryContractId") treasuryContractId: string,
    @Body() request: ExternalTransferEnvironmentalAssetTransactionRequest,
  ): TransactionResponse {
    return this.appService.execute(
      new ExternalTransferEnvironmentalAssetTransactionAppServiceRequest(
        request.format,
        request.accountId,
        environmentalAssetContractId,
        treasuryContractId,
        request.tokenId,
      ),
    )
  }
}
