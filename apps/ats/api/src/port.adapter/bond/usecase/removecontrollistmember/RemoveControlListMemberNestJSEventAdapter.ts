// SPDX-License-Identifier: Apache-2.0
import { type CommandBus, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { RemovedFromControlListDLTEvent } from "@port/bond/usecase/removecontrollistmember/model/RemovedFromControlListDLTEvent"
import { RemoveControlListMemberCommand } from "@app/bond/removecontrollistmember/command/RemoveControlListMemberCommand"
import { RemoveControlListMemberPort } from "@port/bond/usecase/removecontrollistmember/RemoveControlListMemberPort"

@Singleton()
export class RemoveControlListMemberNestJSEventAdapter
  implements RemoveControlListMemberPort, EventListener<RemovedFromControlListDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(RemovedFromControlListDLTEvent)
  async handle(event: RemovedFromControlListDLTEvent): Promise<void> {
    await this.commandBus.execute(new RemoveControlListMemberCommand(event.contractId, event.account))
  }
}
