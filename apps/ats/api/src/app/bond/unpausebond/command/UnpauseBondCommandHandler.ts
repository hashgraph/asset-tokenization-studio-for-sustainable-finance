import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Validate } from "@hashgraph/green-bonds-shared-core"
import { UnpauseBondCommand } from "@app/bond/unpausebond/command/UnpauseBondCommand"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"
import type { BondRepository } from "@domain/bond/repositories/BondRepository"
import { BondUnpausedEvent } from "@domain/bond/events/BondUnpausedEvent"

@Handler(UnpauseBondCommand)
export class UnpauseBondCommandHandler implements CommandHandler<UnpauseBondCommand, void> {
  constructor(
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
    @Inject() private readonly bondRepository: BondRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: UnpauseBondCommand): Promise<void> {
    const bond = await this.checkBondExistsDomainService.execute(command.bondContractId)

    bond.unpause()
    await this.bondRepository.save(bond)

    this.eventBus.publish(new BondUnpausedEvent(bond.contractId))
  }
}
