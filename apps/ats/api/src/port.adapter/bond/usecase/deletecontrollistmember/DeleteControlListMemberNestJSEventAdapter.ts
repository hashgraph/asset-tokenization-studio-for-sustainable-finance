// SPDX-License-Identifier: Apache-2.0
import { type CommandBus, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { DeletedFromControlListDLTEvent } from "@port/bond/usecase/deletecontrollistmember/model/DeletedFromControlListDLTEvent"
import { DeleteControlListMemberCommand } from "@app/bond/deletecontrollistmember/command/DeleteControlListMemberCommand"
import { DeleteControlListMemberPort } from "@port/bond/usecase/deletecontrollistmember/DeleteControlListMemberPort"

@Singleton()
export class DeleteControlListMemberNestJSEventAdapter
  implements DeleteControlListMemberPort, EventListener<DeletedFromControlListDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(DeletedFromControlListDLTEvent)
  async handle(event: DeletedFromControlListDLTEvent): Promise<void> {
    await this.commandBus.execute(new DeleteControlListMemberCommand(event.contractId, event.account))
  }
}
