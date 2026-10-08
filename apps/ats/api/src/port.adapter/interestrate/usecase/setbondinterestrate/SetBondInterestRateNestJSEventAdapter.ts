// SPDX-License-Identifier: Apache-2.0
import { type CommandBus, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { InterestRateUpdatedDLTEvent } from "@port/interestrate/usecase/setbondinterestrate/model/InterestRateUpdatedDLTEvent"
import { SetBondInterestRateCommand } from "@app/interestrate/setbondinterestrate/command/SetBondInterestRateCommand"
import { SetBondInterestRatePort } from "@port/interestrate/usecase/setbondinterestrate/SetBondInterestRatePort"

@Singleton()
export class SetBondInterestRateNestJSEventAdapter
  implements SetBondInterestRatePort, EventListener<InterestRateUpdatedDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(InterestRateUpdatedDLTEvent)
  async handle(event: InterestRateUpdatedDLTEvent): Promise<void> {
    const { newInterestRate } = event
    await this.commandBus.execute(
      new SetBondInterestRateCommand(
        event.contractId,
        event.operator,
        newInterestRate.maxRate,
        newInterestRate.baseRate,
        newInterestRate.minRate,
        newInterestRate.startPeriod,
        newInterestRate.startRate,
        newInterestRate.missedPenalty,
        newInterestRate.reportPeriod,
        newInterestRate.rateDecimals,
      ),
    )
  }
}
