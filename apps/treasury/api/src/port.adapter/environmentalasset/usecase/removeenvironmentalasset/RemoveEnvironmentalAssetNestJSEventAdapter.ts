import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { ConverterUtils, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { RemoveEnvironmentalAssetCommand } from "@app/environmentalasset/removeenvironmentalasset/command/RemoveEnvironmentalAssetCommand"
import { EnvironmentalAssetRemovedDLTEvent } from "@port/environmentalasset/usecase/removeenvironmentalasset/model/EnvironmentalAssetRemovedDLTEvent"
import { RemoveEnvironmentalAssetPort } from "./RemoveEnvironmentalAssetPort"

@Singleton()
export class RemoveEnvironmentalAssetNestJSEventAdapter
  implements RemoveEnvironmentalAssetPort, EventListener<EnvironmentalAssetRemovedDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(EnvironmentalAssetRemovedDLTEvent)
  async handle(event: EnvironmentalAssetRemovedDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new RemoveEnvironmentalAssetCommand(
        event.contractId,
        await ConverterUtils.getHederaAddressFromEvm(event.environmentalAsset),
        event.dissociationError,
      ),
    )
  }
}
