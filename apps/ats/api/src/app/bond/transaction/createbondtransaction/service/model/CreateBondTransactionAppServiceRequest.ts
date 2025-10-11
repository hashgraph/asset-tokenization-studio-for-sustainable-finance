import { BaseTransactionAppServiceRequest } from '@hashgraph/green-bonds-shared-core'
import { Type } from 'class-transformer'
import { IsNotEmpty, ValidateNested } from 'class-validator'
import { SecurityTokenCreationAppServiceRequest } from './SecurityTokenCreationAppServiceRequest'
import { FactoryRegulationAppServiceRequest } from './FactoryRegulationAppServiceRequest'
import { TreasuryAppServiceRequest } from './TreasuryAppServiceRequest'
import { KpiAppServiceRequest } from './KpiAppServiceRequest'

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

  constructor(
    format: string,
    accountId: string,
    contractId: string,
    securityTokenToCreate: SecurityTokenCreationAppServiceRequest,
    factoryRegulationData: FactoryRegulationAppServiceRequest,
    treasuryData: TreasuryAppServiceRequest,
    kpiData: KpiAppServiceRequest,
  ) {
    super(format, accountId, contractId)
    this.securityTokenToCreate = securityTokenToCreate
    this.factoryRegulationData = factoryRegulationData
    this.treasuryData = treasuryData
    this.kpiData = kpiData
  }
}
