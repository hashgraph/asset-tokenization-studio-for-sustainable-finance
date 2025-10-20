import { BaseTransactionAppServiceRequest } from '@hashgraph/green-bonds-shared-core'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateOfferingTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNotEmpty()
  @IsString()
  readonly bondContractId: string

  @IsNotEmpty()
  @IsString()
  readonly treasuryAddress: string

  @IsNotEmpty()
  @IsString()
  readonly paymentTokenAddress: string

  @IsNotEmpty()
  @IsNumber()
  readonly lotSize: number

  @IsNotEmpty()
  @IsNumber()
  readonly minQuantity: number

  @IsNotEmpty()
  @IsNumber()
  readonly maxQuantity: number

  @IsNotEmpty()
  @IsNumber()
  readonly targetQuantity: number

  @IsNotEmpty()
  @IsNumber()
  readonly targetQuantityRule: number

  @IsNotEmpty()
  @IsString()
  readonly startDate: string

  @IsNotEmpty()
  @IsString()
  readonly endDate: string

  @IsNotEmpty()
  @IsNumber()
  readonly deadlineRule: number

  constructor(
    format: string,
    accountId: string,
    contractId: string,
    bondContractId: string,
    treasuryAddress: string,
    paymentTokenAddress: string,
    lotSize: number,
    minQuantity: number,
    maxQuantity: number,
    targetQuantity: number,
    targetQuantityRule: number,
    startDate: string,
    endDate: string,
    deadlineRule: number,
  ) {
    super(format, accountId, contractId)
    this.bondContractId = bondContractId
    this.treasuryAddress = treasuryAddress
    this.paymentTokenAddress = paymentTokenAddress
    this.lotSize = lotSize
    this.minQuantity = minQuantity
    this.maxQuantity = maxQuantity
    this.targetQuantity = targetQuantity
    this.targetQuantityRule = targetQuantityRule
    this.startDate = startDate
    this.endDate = endDate
    this.deadlineRule = deadlineRule
  }
}
