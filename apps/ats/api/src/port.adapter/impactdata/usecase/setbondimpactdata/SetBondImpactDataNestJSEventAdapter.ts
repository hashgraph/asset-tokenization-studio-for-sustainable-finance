// SPDX-License-Identifier: Apache-2.0
import { type CommandBus, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { ImpactDataUpdatedDLTEvent } from "@port/impactdata/usecase/setbondimpactdata/model/ImpactDataUpdatedDLTEvent"
import { SetBondImpactDataCommand } from "@app/impactdata/setbondimpactdata/command/SetBondImpactDataCommand"
import { SetBondImpactDataPort } from "@port/impactdata/usecase/setbondimpactdata/SetBondImpactDataPort"

@Singleton()
export class SetBondImpactDataNestJSEventAdapter
  implements SetBondImpactDataPort, EventListener<ImpactDataUpdatedDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(ImpactDataUpdatedDLTEvent)
  async handle(event: ImpactDataUpdatedDLTEvent): Promise<void> {
    const { newImpactData } = event
    await this.commandBus.execute(
      new SetBondImpactDataCommand(
        event.contractId,
        event.operator,
        newImpactData.maxDeviationCap,
        newImpactData.baseLine,
        newImpactData.maxDeviationFloor,
        newImpactData.impactDataDecimals,
        newImpactData.adjustmentPrecision,
      ),
    )
  }
}
