import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Validate } from "@hashgraph/green-bonds-shared-core"
import { PauseTreasuryCommand } from "@app/treasury/pausetreasury/command/PauseTreasuryCommand"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"
import type { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import { TreasuryPausedEvent } from "@domain/treasury/event/TreasuryPausedEvent"

@Handler(PauseTreasuryCommand)
export class PauseTreasuryCommandHandler implements CommandHandler<PauseTreasuryCommand, void> {
  constructor(
    private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService,
    @Inject() private readonly treasuryRepository: TreasuryRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: PauseTreasuryCommand): Promise<void> {
    const treasury = await this.checkTreasuryExistsDomainService.execute(command.treasuryContractId)

    treasury.pause()
    await this.treasuryRepository.save(treasury)

    this.eventBus.publish(new TreasuryPausedEvent(treasury.contractId))
  }
}
