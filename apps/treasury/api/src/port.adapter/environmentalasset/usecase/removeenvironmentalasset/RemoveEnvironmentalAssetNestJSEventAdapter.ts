import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { RemoveEnvironmentalAssetCommand } from "@app/environmentalasset/removeenvironmentalasset/command/RemoveEnvironmentalAssetCommand"
import { ERC721RemovedDLTEvent } from "@port/environmentalasset/usecase/removeenvironmentalasset/model/ERC721RemovedDLTEvent"
import { RemoveEnvironmentalAssetPort } from "./RemoveEnvironmentalAssetPort"

@Singleton()
export class RemoveEnvironmentalAssetNestJSEventAdapter
  implements RemoveEnvironmentalAssetPort, EventListener<ERC721RemovedDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(ERC721RemovedDLTEvent)
  async handle(event: ERC721RemovedDLTEvent): Promise<void> {
    await this.commandBus.execute(new RemoveEnvironmentalAssetCommand(event.operator, event.erc721))
  }
}
