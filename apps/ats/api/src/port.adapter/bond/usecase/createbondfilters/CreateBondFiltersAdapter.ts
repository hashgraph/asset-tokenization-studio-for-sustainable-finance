// SPDX-License-Identifier: Apache-2.0
import {
  type CommandBus,
  ConverterUtils,
  EventListener,
  Handler,
  Inject,
  Singleton,
} from "@hashgraph/green-bonds-shared-core"
import { CreatedBondEvent } from "@domain/bond/events/CreatedBondEvent"
import { AddEventFiltersCommand } from "@hashgraph/green-bonds-blockchain-listener/dist/app/eventfilter/addeventfilters/command/AddEventFiltersCommand"
import { CreateBondFiltersPort } from "@port/bond/usecase/createbondfilters/CreateBondFiltersPort"

@Singleton()
export class CreateBondFiltersAdapter implements CreateBondFiltersPort, EventListener<CreatedBondEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(CreatedBondEvent)
  async handle(event: CreatedBondEvent): Promise<void> {
    await this.commandBus.execute(
      new AddEventFiltersCommand(await ConverterUtils.getEvmAddressFromHederaAddress(event.contractId), [
        "DocumentUpdated(bytes32 indexed _name,string _uri,bytes32 _documentHash)",
        "DocumentRemoved(bytes32 indexed name,string uri,bytes32 documentHash)",
      ]),
    )
  }
}
