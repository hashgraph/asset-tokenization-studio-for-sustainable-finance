// SPDX-License-Identifier: Apache-2.0
import { type CommandBus, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { KpiDataAddedDLTEvent } from "@port/kpidata/usecase/addbondkpidata/model/KpiDataAddedDLTEvent"
import { AddBondKpiDataCommand } from "@app/kpidata/addbondkpidata/command/AddBondKpiDataCommand"
import { AddBondKpiDataPort } from "@port/kpidata/usecase/addbondkpidata/AddBondKpiDataPort"

@Singleton()
export class AddBondKpiDataNestJSEventAdapter implements AddBondKpiDataPort, EventListener<KpiDataAddedDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(KpiDataAddedDLTEvent)
  async handle(event: KpiDataAddedDLTEvent): Promise<void> {
    await this.commandBus.execute(new AddBondKpiDataCommand(event.contractId, event.project, event.date, event.value))
  }
}
