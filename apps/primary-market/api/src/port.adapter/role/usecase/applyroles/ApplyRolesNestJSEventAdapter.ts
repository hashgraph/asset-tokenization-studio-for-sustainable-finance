// SPDX-License-Identifier: Apache-2.0

import { Singleton, Handler, ConverterUtils } from "@hashgraph/green-bonds-shared-core"
import { ApplyRolesPort } from "./ApplyRolesPort"
import {
  RolesAppliedDLTEvent,
  SyncUserRolesAppService,
  SyncUserRolesAppServiceRequest,
} from "@hashgraph/green-bonds-shared-core"

@Singleton()
export class ApplyRolesNestJSEventAdapter implements ApplyRolesPort {
  constructor(private readonly syncUserRolesAppService: SyncUserRolesAppService) {}

  @Handler(RolesAppliedDLTEvent)
  async handle(event: RolesAppliedDLTEvent): Promise<void> {
    const accountId = await ConverterUtils.getHederaAddressFromEvm(event.account)
    await this.syncUserRolesAppService.execute(
      new SyncUserRolesAppServiceRequest(event.contractId, accountId, event.roles, event.actives),
    )
  }
}
