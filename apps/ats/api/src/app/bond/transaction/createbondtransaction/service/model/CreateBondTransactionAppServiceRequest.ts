import { BaseTransactionAppServiceRequest } from '@hashgraph/green-bonds-shared-core'
import { Type } from 'class-transformer'
import { IsNotEmpty, ValidateNested } from 'class-validator'
import { SecurityTokenCreationAppServiceRequest } from './SecurityTokenCreationAppServiceRequest'
import { FactoryRegulationAppServiceRequest } from './FactoryRegulationAppServiceRequest'

export class CreateBondTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @ValidateNested()
  @Type(() => SecurityTokenCreationAppServiceRequest)
  @IsNotEmpty()
  securityTokenToCreate: SecurityTokenCreationAppServiceRequest

  @ValidateNested()
  @Type(() => FactoryRegulationAppServiceRequest)
  @IsNotEmpty()
  factoryRegulationData: FactoryRegulationAppServiceRequest

  constructor(
    format: string,
    accountId: string,
    contractId: string,
    securityTokenToCreate: SecurityTokenCreationAppServiceRequest,
    factoryRegulationData: FactoryRegulationAppServiceRequest,
  ) {
    super(format, accountId, contractId)
    this.securityTokenToCreate = securityTokenToCreate
    this.factoryRegulationData = factoryRegulationData
  }
}
