// SPDX-License-Identifier: Apache-2.0
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { AddBondKpiDataCommand } from "./AddBondKpiDataCommand"
import { AddBondKpiDataDomainService } from "@domain/kpidata/service/AddBondKpiDataDomainService"
import { AddBondKpiDataDomainServiceRequest } from "@domain/kpidata/service/model/AddBondKpiDataDomainServiceRequest"
import { BondKpiDataAddedEvent } from "@domain/kpidata/event/BondKpiDataAddedEvent"

@Singleton()
@Handler(AddBondKpiDataCommand)
export class AddBondKpiDataCommandHandler implements CommandHandler<AddBondKpiDataCommand, void> {
  constructor(
    private readonly addDomainService: AddBondKpiDataDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: AddBondKpiDataCommand): Promise<void> {
    const result = await this.addDomainService.execute(
      new AddBondKpiDataDomainServiceRequest(command.bondContractId, command.project, command.date, command.value),
    )
    this.eventBus.publish(new BondKpiDataAddedEvent(result.bondContractId, result.project, result.date, result.value))
  }
}
