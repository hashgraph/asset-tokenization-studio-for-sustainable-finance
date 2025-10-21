// SPDX-License-Identifier: Apache-2.0

import { ConverterUtils, Handler, Singleton } from "@hashgraph/green-bonds-shared-core"
import { TransferDLTEvent } from "@port/shared/model/TransferDLTEvent"
import { AddPaymentTokenTransferAppService } from "@app/treasury/addpaymenttokentransfer/service/AddPaymentTokenTransferAppService"
import { AddPaymentTokenTransferAppServiceRequest } from "@app/treasury/addpaymenttokentransfer/service/model/AddPaymentTokenTransferAppServiceRequest"
import { AddPaymentTokenTransferPort } from "./AddPaymentTokenTransferPort"

@Singleton()
export class AddPaymentTokenTransferNestJSEventAdapter implements AddPaymentTokenTransferPort {
  constructor(private readonly addPaymentTokenTransferAppService: AddPaymentTokenTransferAppService) {}

  @Handler(TransferDLTEvent)
  async handle(event: TransferDLTEvent): Promise<void> {
    await this.addPaymentTokenTransferAppService.execute({
      paymentTokenContractId: event.contractId,
      fromAccountId: await ConverterUtils.getHederaAddressFromEvm(event.from),
      toAccountId: await ConverterUtils.getHederaAddressFromEvm(event.to),
      amount: event.value,
    } as AddPaymentTokenTransferAppServiceRequest)
  }
}
