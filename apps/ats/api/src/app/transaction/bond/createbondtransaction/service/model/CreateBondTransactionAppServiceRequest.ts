import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { Type } from "class-transformer"
import { IsNotEmpty, IsString, ValidateNested } from "class-validator"
import { SecurityTokenCreationAppServiceRequest } from "./SecurityTokenCreationAppServiceRequest"
import { FactoryRegulationAppServiceRequest } from "./FactoryRegulationAppServiceRequest"
import { TreasuryAppServiceRequest } from "./TreasuryAppServiceRequest"
import { KpiAppServiceRequest } from "./KpiAppServiceRequest"

export class CreateBondTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @ValidateNested()
  @Type(() => SecurityTokenCreationAppServiceRequest)
  @IsNotEmpty()
  securityTokenToCreate: SecurityTokenCreationAppServiceRequest

  @ValidateNested()
  @Type(() => FactoryRegulationAppServiceRequest)
  @IsNotEmpty()
  factoryRegulationData: FactoryRegulationAppServiceRequest

  @ValidateNested()
  @Type(() => TreasuryAppServiceRequest)
  @IsNotEmpty()
  treasuryData: TreasuryAppServiceRequest

  @ValidateNested()
  @Type(() => KpiAppServiceRequest)
  @IsNotEmpty()
  kpiData: KpiAppServiceRequest

  @IsString()
  @IsNotEmpty()
  factoryAddress: string

  constructor(
    format: string,
    accountId: string,
    bondContractId: string,
    securityTokenToCreate: SecurityTokenCreationAppServiceRequest,
    factoryRegulationData: FactoryRegulationAppServiceRequest,
    treasuryData: TreasuryAppServiceRequest,
    kpiData: KpiAppServiceRequest,
    factoryAddress: string,
  ) {
    super(format, accountId, bondContractId)
    this.securityTokenToCreate = securityTokenToCreate
    this.factoryRegulationData = factoryRegulationData
    this.treasuryData = treasuryData
    this.kpiData = kpiData
    this.factoryAddress = factoryAddress
  }
}
