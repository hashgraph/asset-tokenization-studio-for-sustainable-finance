import { CommandHandler, Handler, Inject, Singleton, Validate } from '@hashgraph/green-bonds-shared-core'
import { CreateBondCommand } from './CreateBondCommand'
import { CreateBondDomainService } from '@domain/bond/services/CreateBondDomainService'
import type { EventBus } from '@hashgraph/green-bonds-shared-core'
import { CreatedBondEvent } from '@domain/bond/events/CreatedBondEvent'

@Singleton()
@Handler(CreateBondCommand)
export class CreateBondCommandHandler implements CommandHandler<CreateBondCommand, void> {
  constructor(
    private readonly createBondDomainService: CreateBondDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: CreateBondCommand): Promise<void> {
    const bond = await this.createBondDomainService.execute(command)
    this.eventBus.publish(
      new CreatedBondEvent(
        bond.contractId,
        bond.name,
        bond.symbol,
        bond.isin,
        bond.decimals,
        bond.currency,
        bond.nominalValue,
        bond.startingDate,
        bond.maturityDate,
        bond.maxSupply,
      ),
    )
  }
}
