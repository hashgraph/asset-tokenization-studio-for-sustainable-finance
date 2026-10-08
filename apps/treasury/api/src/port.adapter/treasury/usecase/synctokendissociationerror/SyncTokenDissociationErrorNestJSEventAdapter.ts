// SPDX-License-Identifier: Apache-2.0

import { ConverterUtils, Handler, Singleton } from "@hashgraph/green-bonds-shared-core"
import { SyncTokenDissociationErrorPort } from "@port/treasury/usecase/synctokendissociationerror/SyncTokenDissociationErrorPort"
import { TokenDissociatedDLTEvent } from "@port/treasury/usecase/synctokendissociationerror/model/TokenDissociatedDLTEvent"
import { SyncTokenDissociationErrorAppService } from "@app/treasury/synctokendissociationerror/service/SyncTokenDissociationErrorAppService"
import { SyncTokenDissociationErrorAppServiceRequest } from "@app/treasury/synctokendissociationerror/service/model/SyncTokenDissociationErrorAppServiceRequest"

@Singleton()
export class SyncTokenDissociationErrorNestJSEventAdapter implements SyncTokenDissociationErrorPort {
  constructor(private readonly syncTokenDissociationErrorAppService: SyncTokenDissociationErrorAppService) {}

  @Handler(TokenDissociatedDLTEvent)
  async handle(event: TokenDissociatedDLTEvent): Promise<void> {
    await this.syncTokenDissociationErrorAppService.execute(
      new SyncTokenDissociationErrorAppServiceRequest(
        event.contractId,
        await ConverterUtils.getHederaAddressFromEvm(event.token),
      ),
    )
  }
}
