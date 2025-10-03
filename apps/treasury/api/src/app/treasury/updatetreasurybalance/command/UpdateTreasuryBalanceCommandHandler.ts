import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { UpdateTreasuryBalanceCommand } from "@app/treasury/updatetreasurybalance/command/UpdateTreasuryBalanceCommand"
import { UpdateTreasuryBalanceDomainService } from "@domain/treasury/services/UpdateTreasuryBalanceDomainService"
import { TreasuryBalanceUpdatedEvent } from "@domain/treasury/event/TreasuryBalanceUpdatedEvent"

@Singleton()
@Handler(UpdateTreasuryBalanceCommand)
export class UpdateTreasuryBalanceCommandHandler implements CommandHandler<UpdateTreasuryBalanceCommand, void> {
  constructor(
    private readonly updateTreasuryBalanceDomainService: UpdateTreasuryBalanceDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: UpdateTreasuryBalanceCommand): Promise<void> {
    const treasury = await this.updateTreasuryBalanceDomainService.execute(
      command.fromAddress,
      command.toAddress,
      command.amount,
    )
    this.eventBus.publish(
      new TreasuryBalanceUpdatedEvent(
        treasury.contractAddress,
        treasury.bondContractAddress,
        command.amount,
        treasury.balance,
      ),
    )
  }
}
