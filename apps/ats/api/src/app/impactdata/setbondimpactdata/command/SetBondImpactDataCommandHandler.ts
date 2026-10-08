// SPDX-License-Identifier: Apache-2.0
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { SetBondImpactDataCommand } from "./SetBondImpactDataCommand"
import { SetBondImpactDataDomainService } from "@domain/impactdata/service/SetBondImpactDataDomainService"
import { SetBondImpactDataDomainServiceRequest } from "@domain/impactdata/service/model/SetBondImpactDataDomainServiceRequest"
import { BondImpactDataSetEvent } from "@domain/impactdata/event/BondImpactDataSetEvent"

@Singleton()
@Handler(SetBondImpactDataCommand)
export class SetBondImpactDataCommandHandler implements CommandHandler<SetBondImpactDataCommand, void> {
  constructor(
    private readonly setDomainService: SetBondImpactDataDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: SetBondImpactDataCommand): Promise<void> {
    const result = await this.setDomainService.execute(
      new SetBondImpactDataDomainServiceRequest(
        command.bondContractId,
        command.operator,
        command.maxDeviationCap,
        command.baseLine,
        command.maxDeviationFloor,
        command.impactDataDecimals,
        command.adjustmentPrecision,
      ),
    )
    this.eventBus.publish(
      new BondImpactDataSetEvent(
        result.bondContractId,
        result.operator,
        result.maxDeviationCap,
        result.baseLine,
        result.maxDeviationFloor,
        result.impactDataDecimals,
        result.adjustmentPrecision,
      ),
    )
  }
}
