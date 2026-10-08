// SPDX-License-Identifier: Apache-2.0

import { SyncEnvironmentalAssetTokenPort } from "@port/environmentalasset/usecase/syncenvironmentalassettoken/SyncEnvironmentalAssetTokenPort"
import { ConverterUtils, Handler, Singleton } from "@hashgraph/green-bonds-shared-core"
import { TransferDLTEvent } from "@port/shared/model/TransferDLTEvent"
import { SyncEnvironmentalAssetTokenAppService } from "@app/environmentalasset/syncenvironmentalassettoken/service/SyncEnvironmentalAssetTokenAppService"
import { SyncEnvironmentalAssetTokenAppServiceRequest } from "@app/environmentalasset/syncenvironmentalassettoken/service/model/SyncEnvironmentalAssetTokenAppServiceRequest"

@Singleton()
export class SyncEnvironmentalAssetTokenNestJSEventAdapter implements SyncEnvironmentalAssetTokenPort {
  constructor(private readonly syncEnvironmentalAssetTokenAppService: SyncEnvironmentalAssetTokenAppService) {}

  @Handler(TransferDLTEvent)
  async handle(event: TransferDLTEvent): Promise<void> {
    await this.syncEnvironmentalAssetTokenAppService.execute({
      environmentalAssetContractId: event.contractId,
      fromAccountId: await ConverterUtils.getHederaAddressFromEvm(event.from),
      toAccountId: await ConverterUtils.getHederaAddressFromEvm(event.to),
      tokenId: event.tokenId,
    } as SyncEnvironmentalAssetTokenAppServiceRequest)
  }
}
