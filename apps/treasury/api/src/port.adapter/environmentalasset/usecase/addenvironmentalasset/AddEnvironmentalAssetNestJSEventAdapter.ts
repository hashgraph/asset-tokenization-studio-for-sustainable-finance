import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { AddEnvironmentalAssetCommand } from "@app/environmentalasset/addenvironmentalasset/command/AddEnvironmentalAssetCommand"
import { ERC721AddedDLTEvent } from "@port/environmentalasset/usecase/addenvironmentalasset/model/ERC721AddedDLTEvent"
import { AddEnvironmentalAssetPort } from "./AddEnvironmentalAssetPort"

@Singleton()
export class AddEnvironmentalAssetNestJSEventAdapter
  implements AddEnvironmentalAssetPort, EventListener<ERC721AddedDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(ERC721AddedDLTEvent)
  async handle(event: ERC721AddedDLTEvent): Promise<void> {
    await this.commandBus.execute(new AddEnvironmentalAssetCommand(event.operator, event.erc721))
  }
}
