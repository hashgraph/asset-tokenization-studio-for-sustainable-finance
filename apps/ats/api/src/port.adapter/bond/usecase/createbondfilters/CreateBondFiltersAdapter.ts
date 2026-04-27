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
        "CouponSet(bytes32 corporateActionId,uint256 couponId,address indexed operator,(uint256 recordDate,uint256 executionDate,uint256 startDate,uint256 endDate,uint256 fixingDate,uint256 rate,uint8 rateDecimals,uint8 rateStatus) coupon)",
        "IssuedByPartition(bytes32 indexed partition,address indexed operator,address indexed to,uint256 value,bytes data)",
        "RedeemedByPartition(bytes32 indexed partition,address indexed operator,address indexed from,uint256 value,bytes data,bytes operatorData)",
        "LockedByPartition(address indexed operator,address indexed tokenHolder,bytes32 indexed partition,uint256 lockId,uint256 amount,uint256 expirationTimestamp)",
        "LockByPartitionReleased(address indexed operator,address indexed tokenHolder,bytes32 indexed partition,uint256 lockId)",
        "TransferByPartition(bytes32 indexed _fromPartition,address _operator,address indexed _from,address indexed _to,uint256 _value,bytes _data,bytes _operatorData)",
        "HeldByPartition(address indexed operator,address indexed tokenHolder,bytes32 partition,uint256 holdId,(uint256 amount,uint256 expirationTimestamp,address escrow,address to,bytes data) hold,bytes operatorData)",
        "HoldByPartitionExecuted(address indexed tokenHolder,bytes32 indexed partition,uint256 holdId,uint256 amount,address to)",
        "HoldByPartitionReleased(address indexed tokenHolder,bytes32 indexed partition,uint256 holdId,uint256 amount)",
        "HoldByPartitionReclaimed(address indexed operator,address indexed tokenHolder,bytes32 indexed partition,uint256 holdId,uint256 amount)",
        "ClearedHoldByPartition(address indexed operator,address indexed tokenHolder,bytes32 partition,uint256 clearingId,(uint256 amount,uint256 expirationTimestamp,address escrow,address to,bytes data) hold,uint256 expirationDate,bytes data,bytes operatorData)",
        "ClearedRedeemByPartition(address indexed operator,address indexed tokenHolder,bytes32 partition,uint256 clearingId,uint256 amount,uint256 expirationDate,bytes data,bytes operatorData)",
        "ClearedTransferByPartition(address indexed operator,address indexed tokenHolder,address indexed to,bytes32 partition,uint256 clearingId,uint256 amount,uint256 expirationDate,bytes data,bytes operatorData)",
        "ClearingOperationApproved(address indexed operator,address indexed tokenHolder,bytes32 indexed partition,uint256 clearingId,uint8 clearingOperationType,bytes operationData)",
        "ClearingOperationCanceled(address indexed operator,address indexed tokenHolder,bytes32 indexed partition,uint256 clearingId,uint8 clearingOperationType)",
        "ClearingOperationReclaimed(address indexed operator,address indexed tokenHolder,bytes32 indexed partition,uint256 clearingId,uint8 clearingOperationType)",
        "RoleGranted(address indexed operator,address indexed account,bytes32 indexed role)",
        "RoleRevoked(address indexed operator,address indexed account,bytes32 indexed role)",
        "TokenPaused(address indexed operator)",
        "TokenUnpaused(address indexed operator)",
        "ProceedRecipientAdded(address indexed operator,address indexed proceedRecipient,bytes data)",
        "ProceedRecipientRemoved(address indexed operator,address indexed proceedRecipient)",
        "KpiDataAdded(address indexed project,uint256 date,uint256 value)",
        "InterestRateUpdated(address indexed operator,(uint256 maxRate,uint256 baseRate,uint256 minRate,uint256 startPeriod,uint256 startRate,uint256 missedPenalty,uint256 reportPeriod,uint8 rateDecimals) newInterestRate)",
        "ImpactDataUpdated(address indexed operator,(uint256 maxDeviationCap,uint256 baseLine,uint256 maxDeviationFloor,uint8 impactDataDecimals,uint256 adjustmentPrecision) newImpactData)",
      ]),
    )
  }
}
