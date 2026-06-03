// SPDX-License-Identifier: Apache-2.0
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { SetBondInterestRateCommand } from "./SetBondInterestRateCommand"
import { SetBondInterestRateDomainService } from "@domain/interestrate/service/SetBondInterestRateDomainService"
import { SetBondInterestRateDomainServiceRequest } from "@domain/interestrate/service/model/SetBondInterestRateDomainServiceRequest"
import { BondInterestRateSetEvent } from "@domain/interestrate/event/BondInterestRateSetEvent"

@Singleton()
@Handler(SetBondInterestRateCommand)
export class SetBondInterestRateCommandHandler implements CommandHandler<SetBondInterestRateCommand, void> {
  constructor(
    private readonly setDomainService: SetBondInterestRateDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: SetBondInterestRateCommand): Promise<void> {
    const result = await this.setDomainService.execute(
      new SetBondInterestRateDomainServiceRequest(
        command.bondContractId,
        command.operator,
        command.maxRate,
        command.baseRate,
        command.minRate,
        command.startPeriod,
        command.startRate,
        command.missedPenalty,
        command.reportPeriod,
        command.rateDecimals,
      ),
    )
    this.eventBus.publish(
      new BondInterestRateSetEvent(
        result.bondContractId,
        result.operator,
        result.maxRate,
        result.baseRate,
        result.minRate,
        result.startPeriod,
        result.startRate,
        result.missedPenalty,
        result.reportPeriod,
        result.rateDecimals,
      ),
    )
  }
}
