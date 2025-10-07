import { BaseBuildTransactionRequest } from '@hashgraph/green-bonds-shared-core'
import { Type } from 'class-transformer'
import { IsNotEmpty, ValidateNested } from 'class-validator'
import { SecurityTokenCreationRequest } from '@port/shared/model/SecurityTokenCreationRequest'
import { FactoryRegulationRequest } from '@port/shared/model/FactoryRegulationRequest'

export class BuildCreateBondTransactionRequest extends BaseBuildTransactionRequest {
  @ValidateNested()
  @Type(() => SecurityTokenCreationRequest)
  @IsNotEmpty()
  securityTokenToCreate: SecurityTokenCreationRequest

  @ValidateNested()
  @Type(() => FactoryRegulationRequest)
  @IsNotEmpty()
  factoryRegulationData: FactoryRegulationRequest
}
