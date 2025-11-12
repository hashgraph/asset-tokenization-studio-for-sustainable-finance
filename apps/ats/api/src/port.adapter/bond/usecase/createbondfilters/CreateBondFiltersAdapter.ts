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
import { CreateBondFiltersPort } from "@port/bond/usecase/createbondfilters/CreateBondFiltersPort"
import { AddEventFiltersCommand } from "@hashgraph/green-bonds-blockchain-listener"

@Singleton()
export class CreateBondFiltersAdapter implements CreateBondFiltersPort, EventListener<CreatedBondEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(CreatedBondEvent)
  async handle(event: CreatedBondEvent): Promise<void> {
    await this.commandBus.execute(
      new AddEventFiltersCommand(await ConverterUtils.getEvmAddressFromHederaAddress(event.contractId), [
        "DocumentUpdated(bytes32 indexed _name,string _uri,bytes32 _documentHash)",
        "DocumentRemoved(bytes32 indexed _name,string _uri,bytes32 _documentHash)",
        "MaxSupplySet(address indexed operator,uint256 newMaxSupply,uint256 previousMaxSupply)",
        "AddedToControlList(address indexed operator,address indexed account)",
        "RemovedFromControlList(address indexed operator,address indexed account)",
        "CouponSet(bytes32 corporateActionId,uint256 couponId,address indexed operator,uint256 indexed recordDate,uint256 indexed executionDate,uint256 rate,uint256 rateDecimals,uint256 period)",
        "IssuedByPartition(bytes32 indexed partition,address indexed operator,address indexed to,uint256 value,bytes data)",
        "LockedByPartition(address indexed operator,address indexed tokenHolder,bytes32 indexed partition,uint256 lockId,uint256 amount,uint256 expirationTimestamp)",
      ]),
    )
  }
}
