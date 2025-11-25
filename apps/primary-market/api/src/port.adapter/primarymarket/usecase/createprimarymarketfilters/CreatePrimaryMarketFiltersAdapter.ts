// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { ConverterUtils, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { PrimaryMarketDeployedEvent } from "@domain/primarymarket/events/PrimaryMarketDeployedEvent"
import { CreatePrimaryMarketFiltersPort } from "./CreatePrimaryMarketFiltersPort"
import { AddEventFiltersCommand } from "@hashgraph/green-bonds-blockchain-listener"

@Singleton()
export class CreatePrimaryMarketFiltersAdapter
  implements CreatePrimaryMarketFiltersPort, EventListener<PrimaryMarketDeployedEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(PrimaryMarketDeployedEvent)
  async handle(event: PrimaryMarketDeployedEvent): Promise<void> {
    await this.commandBus.execute(
      new AddEventFiltersCommand(await ConverterUtils.getEvmAddressFromHederaAddress(event.contractId), [
        "OfferingCreated(uint256 indexed offeringId,address indexed operator,(address asset,address treasury,address paymentToken,uint256 lotSize,uint256 minLots,uint256 maxLots,uint256 targetLots,uint8 targetQuantityRule,uint256 startDate,uint256 endDate,uint8 deadlineRule,uint256 price) offering)",
        "RoleGranted(address indexed operator,address indexed account,bytes32 indexed role)",
        "RoleRenounced(address indexed account, bytes32 indexed role)",
        "RolesApplied(bytes32[] roles, bool[] actives, address account)",
        "TokenPaused(address indexed operator)",
        "TokenUnpaused(address indexed operator)",
        "SubscriptionSubmitted(uint256 indexed offeringId,uint256 indexed subscriptionId,address indexed investor,uint256 lotUnits)",
        "SubscriptionCancelled(uint256 indexed offeringId,uint256 indexed subscriptionId)",
        "OfferingExecuted(uint256 indexed offeringId,address indexed operator,uint256[] subscriptionIdsSuccess,uint256[] subscriptionIdsFailed)",
        "OfferingCancelled(uint256 indexed offeringId,address indexed operator,uint256[] subscriptionIdsSuccess,uint256[] subscriptionIdsFailed)",
      ]),
    )
  }
}
