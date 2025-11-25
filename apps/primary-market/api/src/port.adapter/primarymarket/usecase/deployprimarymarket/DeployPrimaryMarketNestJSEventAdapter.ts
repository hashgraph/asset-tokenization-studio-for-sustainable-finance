// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { Singleton, Handler, Inject, ConverterUtils, EventListener } from "@hashgraph/green-bonds-shared-core"
import { DeployPrimaryMarketPort } from "./DeployPrimaryMarketPort"
import { PrimaryMarketDeployedDLTEvent } from "./model/PrimaryMarketDeployedDLTEvent"
import { DeployPrimaryMarketCommand } from "@app/primarymarket/deployprimarymarket/command/DeployPrimaryMarketCommand"

@Singleton()
export class DeployPrimaryMarketNestJSEventAdapter
  implements DeployPrimaryMarketPort, EventListener<PrimaryMarketDeployedDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(PrimaryMarketDeployedDLTEvent)
  async handle(event: PrimaryMarketDeployedDLTEvent): Promise<void> {
    const contractId = await ConverterUtils.getHederaAddressFromEvm(event.primaryMarketAddress)

    await this.commandBus.execute(new DeployPrimaryMarketCommand(contractId))
  }
}
