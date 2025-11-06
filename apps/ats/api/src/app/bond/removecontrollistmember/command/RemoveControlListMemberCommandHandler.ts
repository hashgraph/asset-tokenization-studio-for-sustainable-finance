// SPDX-License-Identifier: Apache-2.0
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { RemoveControlListMemberCommand } from "./RemoveControlListMemberCommand"
import { RemoveBondControlListMemberDomainService } from "@domain/bond/controllist/service/RemoveBondControlListMemberDomainService"
import { BondControlListMemberRemovedEvent } from "@domain/bond/controllist/event/BondControlListMemberRemovedEvent"

@Singleton()
@Handler(RemoveControlListMemberCommand)
export class RemoveControlListMemberCommandHandler implements CommandHandler<RemoveControlListMemberCommand, void> {
  constructor(
    private readonly deleteBondControlListMemberDomainService: RemoveBondControlListMemberDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: RemoveControlListMemberCommand): Promise<void> {
    await this.deleteBondControlListMemberDomainService.execute(command)
    this.eventBus.publish(new BondControlListMemberRemovedEvent(command.contractId, command.holderId))
  }
}
