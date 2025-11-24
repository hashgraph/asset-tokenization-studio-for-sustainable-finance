// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { SetBondCouponTransactionRequest } from "./model/SetBondCouponTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
import { SetBondCouponTransactionPort } from "./SetBondCouponTransactionPort"
import { SetBondCouponTransactionAppService } from "@app/bond/transaction/setbondcoupontransaction/service/SetBondCouponTransactionAppService"
import { SetBondCouponTransactionAppServiceRequest } from "@app/bond/transaction/setbondcoupontransaction/service/model/SetBondCouponTransactionAppServiceRequest"

@RestController("bonds")
export class SetBondCouponTransactionHttpAdapter implements SetBondCouponTransactionPort {
  constructor(private readonly setCouponTransactionAppService: SetBondCouponTransactionAppService) {}

  @Post(":bondContractId/coupons")
  async setBondCouponTransaction(
    @Param("bondContractId") contractId: string,
    @Body() request: SetBondCouponTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new SetBondCouponTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      contractId,
      request.recordDate.getTime().toString(),
      request.executionDate.getTime().toString(),
      request.rate,
      request.rateDecimals,
      request.period,
    )

    return await this.setCouponTransactionAppService.execute(appServiceRequest)
  }
}
