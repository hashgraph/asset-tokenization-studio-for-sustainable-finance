// SPDX-License-Identifier: Apache-2.0
import { type CommandBus, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { AddedToControlListDLTEvent } from "@port/controllist/usecase/addcontrollistmember/model/AddedToControlListDLTEvent"
import { AddControlListMemberCommand } from "@app/controllist/addcontrollistmember/command/AddControlListMemberCommand"
import { AddControlListMemberPort } from "@port/controllist/usecase/addcontrollistmember/AddControlListMemberPort"

@Singleton()
export class AddControlListMemberNestJSEventAdapter
  implements AddControlListMemberPort, EventListener<AddedToControlListDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(AddedToControlListDLTEvent)
  async handle(event: AddedToControlListDLTEvent): Promise<void> {
    await this.commandBus.execute(new AddControlListMemberCommand(event.contractId, event.account))
  }
}
