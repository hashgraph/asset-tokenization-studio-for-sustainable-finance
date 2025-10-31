// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { ConverterUtils, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { AddEnvironmentalAssetCommand } from "@app/environmentalasset/addenvironmentalasset/command/AddEnvironmentalAssetCommand"
import { EnvironmentalAssetAddedDLTEvent } from "@port/environmentalasset/usecase/addenvironmentalasset/model/ERC721AddedDLTEvent"
import { AddEnvironmentalAssetPort } from "./AddEnvironmentalAssetPort"

@Singleton()
export class AddEnvironmentalAssetNestJSEventAdapter
  implements AddEnvironmentalAssetPort, EventListener<EnvironmentalAssetAddedDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(EnvironmentalAssetAddedDLTEvent)
  async handle(event: EnvironmentalAssetAddedDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new AddEnvironmentalAssetCommand(
        event.contractId,
        await ConverterUtils.getHederaAddressFromEvm(event.environmentalAsset),
      ),
    )
  }
}
