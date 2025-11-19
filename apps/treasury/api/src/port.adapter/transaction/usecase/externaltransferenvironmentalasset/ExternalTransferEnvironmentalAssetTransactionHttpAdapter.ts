// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { ExternalTransferEnvironmentalAssetTransactionRequest } from "@port/transaction/usecase/externaltransferenvironmentalasset/model/ExternalTransferEnvironmentalAssetTransactionRequest"
import { ExternalTransferEnvironmentalAssetTransactionPort } from "@port/transaction/usecase/externaltransferenvironmentalasset/ExternalTransferEnvironmentalAssetTransactionPort"
import { ExternalTransferEnvironmentalAssetTransactionAppService } from "@app/transaction/externaltransferenvironmentalasset/service/service/ExternalTransferEnvironmentalAssetTransactionAppService"
import { ExternalTransferEnvironmentalAssetTransactionAppServiceRequest } from "@app/transaction/externaltransferenvironmentalasset/service/service/model/ExternalTransferEnvironmentalAssetTransactionAppServiceRequest"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Treasury")
@RestController("environmental-assets")
export class ExternalTransferEnvironmentalAssetTransactionHttpAdapter
  implements ExternalTransferEnvironmentalAssetTransactionPort
{
  constructor(private readonly appService: ExternalTransferEnvironmentalAssetTransactionAppService) {}

  @ApiOperation({ summary: "Environmental asset transfers to the treasury" })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post(":assetId/treasuries/:treasuryId/transfer")
  async externalTransferEnvironmentalAsset(
    @Param("assetId") environmentalAssetContractId: string,
    @Param("treasuryId") treasuryContractId: string,
    @Body() request: ExternalTransferEnvironmentalAssetTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.appService.execute(
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
