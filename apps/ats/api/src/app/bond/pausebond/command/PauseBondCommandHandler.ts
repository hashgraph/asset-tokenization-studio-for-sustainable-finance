import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Validate } from "@hashgraph/green-bonds-shared-core"
import { PauseBondCommand } from "@app/bond/pausebond/command/PauseBondCommand"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"
import type { BondRepository } from "@domain/bond/repositories/BondRepository"
import { BondPausedEvent } from "@domain/bond/events/BondPausedEvent"

@Handler(PauseBondCommand)
export class PauseBondCommandHandler implements CommandHandler<PauseBondCommand, void> {
  constructor(
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
    @Inject() private readonly bondRepository: BondRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: PauseBondCommand): Promise<void> {
    const bond = await this.checkBondExistsDomainService.execute(command.bondContractId)

    bond.pause()
    await this.bondRepository.save(bond)

    this.eventBus.publish(new BondPausedEvent(bond.contractId))
  }
}
