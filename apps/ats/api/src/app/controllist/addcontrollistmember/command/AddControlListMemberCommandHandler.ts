// SPDX-License-Identifier: Apache-2.0
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { AddControlListMemberCommand } from "./AddControlListMemberCommand"
import { AddBondControlListMemberDomainService } from "@domain/controllist/service/AddBondControlListMemberDomainService"
import { BondControlListMemberAddedEvent } from "@domain/controllist/event/BondControlListMemberAddedEvent"

@Singleton()
@Handler(AddControlListMemberCommand)
export class AddControlListMemberCommandHandler implements CommandHandler<AddControlListMemberCommand, void> {
  constructor(
    private readonly addBondControlListMemberDomainService: AddBondControlListMemberDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: AddControlListMemberCommand): Promise<void> {
    const member = await this.addBondControlListMemberDomainService.execute(command)
    this.eventBus.publish(new BondControlListMemberAddedEvent(member.bondContractId, member.holderAccountId))
  }
}
