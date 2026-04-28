// SPDX-License-Identifier: Apache-2.0

import { type CommandBus, ConverterUtils, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { CreateTreasuryFiltersPort } from "./CreateTreasuryFiltersPort"
import { TreasuryCreatedEvent } from "@domain/treasury/event/TreasuryCreatedEvent"
import { AddEventFiltersCommand } from "@hashgraph/green-bonds-blockchain-listener"

@Singleton()
export class CreateTreasuryFiltersNestJSEventAdapter implements CreateTreasuryFiltersPort {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(TreasuryCreatedEvent)
  async handle(event: TreasuryCreatedEvent): Promise<void> {
    await this.commandBus.execute(
      new AddEventFiltersCommand(await ConverterUtils.getEvmAddressFromHederaAddress(event.treasuryContractId), [
        "RoleGranted(address indexed operator, address indexed account, bytes32 indexed role)",
        "RoleRevoked(address indexed operator, address indexed account, bytes32 indexed role)",
        "RoleRenounced(address indexed account, bytes32 indexed role)",
        "RolesApplied(bytes32[] roles, bool[] actives, address account)",
        "TokenPaused(address indexed operator)",
        "TokenUnpaused(address indexed operator)",
        "EnvironmentalAssetAdded(address indexed operator, address indexed environmentalAsset)",
        "EnvironmentalAssetRemoved(address indexed operator, address indexed environmentalAsset, " +
          "int256 indexed dissociationError)",
        "PaymentTokenUpdated(address indexed operator, address indexed newPaymentToken, " +
          "address indexed oldPaymentToken, int256 dissociationError)",
        "TokenDissociated(address indexed token)",
        "PaymentTokenTransferred(address indexed to, uint256 indexed amount)",
        "EnvironmentalAssetTokenTransferred(address indexed environmentalAsset, address indexed to, " +
          "uint256 indexed tokenId)",
        "ProceedsRecipientFunded(address indexed proceedsRecipient, uint256 indexed amount)",
        "DistributionExecuted(uint256 distributionID, uint256 pageIndex, uint256 pageLength, " +
          "(address holder, int64 amount, uint8 status)[] results)",
        "DistributionByAddressesExecuted(uint256 distributionID, address[] holders, " +
          "(address holder, int64 amount, uint8 status)[] results)",
        "RedemptionExecuted(uint256 pageIndex, uint256 pageLength, " +
          "(address holder, int64 amount, uint8 status)[] results)",
        "RedemptionByAddressesExecuted(address[] holders, " + "(address holder, int64 amount, uint8 status)[] results)",
      ]),
    )
  }
}
