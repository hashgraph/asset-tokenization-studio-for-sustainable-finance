// SPDX-License-Identifier: Apache-2.0

import { AddEnvironmentalAssetTransferPort } from "@port/environmentalasset/usecase/addenvironmentalassettransfer/AddEnvironmentalAssetTransferPort"
import { ConverterUtils, Handler, Singleton } from "@hashgraph/green-bonds-shared-core"
import { TransferDLTEvent } from "@port/shared/model/TransferDLTEvent"
import { AddEnvironmentalAssetTransferAppService } from "@app/environmentalasset/addenvironmentalassettransfer/service/AddEnvironmentalAssetTransferAppService"
import { AddEnvironmentalAssetTransferAppServiceRequest } from "@app/environmentalasset/addenvironmentalassettransfer/service/model/AddEnvironmentalAssetTransferAppServiceRequest"

@Singleton()
export class AddEnvironmentalAssetTransferNestJSEventAdapter implements AddEnvironmentalAssetTransferPort {
  constructor(private readonly addEnvironmentalAssetTransferAppService: AddEnvironmentalAssetTransferAppService) {}

  @Handler(TransferDLTEvent)
  async handle(event: TransferDLTEvent): Promise<void> {
    await this.addEnvironmentalAssetTransferAppService.execute({
      environmentalAssetContractId: event.contractId,
      fromAccountId: await ConverterUtils.getHederaAddressFromEvm(event.from),
      toAccountId: await ConverterUtils.getHederaAddressFromEvm(event.to),
      tokenId: event.tokenId,
    } as AddEnvironmentalAssetTransferAppServiceRequest)
  }
}
