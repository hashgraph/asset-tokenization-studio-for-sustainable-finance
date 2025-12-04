// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { SetBondCouponTransactionAppServiceRequest } from "@app/transaction/coupon/setbondcoupontransaction/service/model/SetBondCouponTransactionAppServiceRequest"

@Singleton()
export class SetBondCouponTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: SetBondCouponTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.setBondCouponTransaction(request)
  }
}
