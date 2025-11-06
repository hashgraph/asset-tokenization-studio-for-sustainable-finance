// SPDX-License-Identifier: Apache-2.0

import { type CommandBus, ConverterUtils, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { CreateTreasuryFiltersPort } from "./CreateTreasuryFiltersPort"
import { TreasuryCreatedEvent } from "@domain/treasury/event/TreasuryCreatedEvent"
import { AddEventFiltersCommand } from "@hashgraph/green-bonds-blockchain-listener/dist/app/eventfilter/addeventfilters/command/AddEventFiltersCommand"

@Singleton()
export class CreateTreasuryFiltersNestJSEventAdapter implements CreateTreasuryFiltersPort {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(TreasuryCreatedEvent)
  async handle(event: TreasuryCreatedEvent): Promise<void> {
    await this.commandBus.execute(
      new AddEventFiltersCommand(await ConverterUtils.getEvmAddressFromHederaAddress(event.contractId), [
        "RoleGranted(address indexed operator, address indexed account, bytes32 indexed role)",
        "RoleRevoked(address indexed operator, address indexed account, bytes32 indexed role)",
        "RoleRenounced(address indexed account, bytes32 indexed role)",
        "RolesApplied(bytes32[] roles, bool[] actives, address account)",
        "TokenPaused(address indexed operator)",
        "TokenUnpaused(address indexed operator)",
        "EnvironmentalAssetAdded(address indexed operator, address environmentalAsset)",
        "EnvironmentalAssetRemoved(address indexed operator, address environmentalAsset, int256 dissociationError)",
        "PaymentTokenUpdated(address indexed operator, address newPaymentToken, address oldPaymentToken, int256 dissociationError)",
        "TokenDissociated(address token)",
        "PaymentTokenTransferred(address to, uint256 amount)",
        "EnvironmentalAssetTokenTransferred(address environmentalAsset, address to, uint256 tokenId)",
        "ProceedsRecipientFunded(address proceedsRecipient, uint256 amount)",
        "DistributionExecuted(uint256 distributionID, uint256 pageIndex, uint256 pageLength, (address[] failedAddresses, address[] succeededAddresses, address[] alreadyPaidAddresses, uint256[] paidAmounts) result)",
        "DistributionByAddressesExecuted(uint256 distributionID, address[] holders, (address[] failedAddresses, address[] succeededAddresses, address[] alreadyPaidAddresses, uint256[] paidAmounts) result)",
        "RedemptionExecuted(uint256 pageIndex, uint256 pageLength, (address[] failedAddresses, address[] succeededAddresses, address[] alreadyPaidAddresses, uint256[] paidAmounts) result)",
        "RedemptionByAddressesExecuted(address[] holders, (address[] failedAddresses, address[] succeededAddresses, address[] alreadyPaidAddresses, uint256[] paidAmounts) result)",
      ]),
    )
  }
}
