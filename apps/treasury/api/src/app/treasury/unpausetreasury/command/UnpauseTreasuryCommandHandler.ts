import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Validate } from "@hashgraph/green-bonds-shared-core"
import { UnpauseTreasuryCommand } from "@app/treasury/unpausetreasury/command/UnpauseTreasuryCommand"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"
import type { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import { TreasuryUnpausedEvent } from "@domain/treasury/event/TreasuryUnpausedEvent"

@Handler(UnpauseTreasuryCommand)
export class UnpauseTreasuryCommandHandler implements CommandHandler<UnpauseTreasuryCommand, void> {
  constructor(
    private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService,
    @Inject() private readonly treasuryRepository: TreasuryRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: UnpauseTreasuryCommand): Promise<void> {
    const treasury = await this.checkTreasuryExistsDomainService.execute(command.treasuryContractId)

    treasury.unpause()
    await this.treasuryRepository.save(treasury)

    this.eventBus.publish(new TreasuryUnpausedEvent(treasury.contractId))
  }
}
