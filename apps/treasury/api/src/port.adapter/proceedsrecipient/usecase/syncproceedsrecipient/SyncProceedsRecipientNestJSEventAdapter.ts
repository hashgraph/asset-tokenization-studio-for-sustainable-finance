// SPDX-License-Identifier: Apache-2.0

import { SyncProceedsRecipientPort } from "@port/proceedsrecipient/usecase/syncproceedsrecipient/SyncProceedsRecipientPort"
import { ConverterUtils, Handler, Singleton } from "@hashgraph/green-bonds-shared-core"
import { ProceedsRecipientFundedDLTEvent } from "@port/proceedsrecipient/usecase/syncproceedsrecipient/model/ProceedsRecipientFundedDLTEvent"
import { SyncProceedsRecipientAppService } from "@app/proceedsrecipient/syncproceedsrecipient/service/SyncProceedsRecipientAppService"
import { SyncProceedsRecipientAppServiceRequest } from "@app/proceedsrecipient/syncproceedsrecipient/service/model/SyncProceedsRecipientAppServiceRequest"

@Singleton()
export class SyncProceedsRecipientNestJSEventAdapter implements SyncProceedsRecipientPort {
  constructor(private readonly syncProceedsRecipientAppService: SyncProceedsRecipientAppService) {}

  @Handler(ProceedsRecipientFundedDLTEvent)
  async handle(event: ProceedsRecipientFundedDLTEvent): Promise<void> {
    await this.syncProceedsRecipientAppService.execute({
      treasuryContractId: event.contractId,
      proceedsRecipientContractId: await ConverterUtils.getHederaAddressFromEvm(event.proceedsRecipient),
      amount: event.amount,
    } as SyncProceedsRecipientAppServiceRequest)
  }
}
