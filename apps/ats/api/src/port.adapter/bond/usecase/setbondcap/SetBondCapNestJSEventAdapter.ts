// SPDX-License-Identifier: Apache-2.0
import { type CommandBus, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { MaxSupplySetDLTEvent } from "@port/bond/usecase/setbondcap/model/MaxSupplySetDLTEvent"
import { SetBondCapCommand } from "@app/bond/setbondcap/command/SetBondCapCommand"
import { SetBondCapPort } from "@port/bond/usecase/setbondcap/SetBondCapPort"

@Singleton()
export class SetBondCapNestJSEventAdapter implements SetBondCapPort, EventListener<MaxSupplySetDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(MaxSupplySetDLTEvent)
  async handle(event: MaxSupplySetDLTEvent): Promise<void> {
    await this.commandBus.execute(new SetBondCapCommand(event.contractId, event.newMaxSupply))
  }
}
