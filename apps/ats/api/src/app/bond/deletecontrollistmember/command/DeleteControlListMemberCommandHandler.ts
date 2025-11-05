// SPDX-License-Identifier: Apache-2.0
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { DeleteControlListMemberCommand } from "./DeleteControlListMemberCommand"
import { DeleteBondControlListMemberDomainService } from "@domain/bond/controllist/service/DeleteBondControlListMemberDomainService"
import { BondControlListMemberDeletedEvent } from "@domain/bond/controllist/event/BondControlListMemberDeletedEvent"

@Singleton()
@Handler(DeleteControlListMemberCommand)
export class DeleteControlListMemberCommandHandler implements CommandHandler<DeleteControlListMemberCommand, void> {
  constructor(
    private readonly deleteBondControlListMemberDomainService: DeleteBondControlListMemberDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: DeleteControlListMemberCommand): Promise<void> {
    const member = await this.deleteBondControlListMemberDomainService.execute(command)
    this.eventBus.publish(new BondControlListMemberDeletedEvent(member.contractId, member.holderId))
  }
}
