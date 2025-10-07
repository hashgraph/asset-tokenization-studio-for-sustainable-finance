// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from '@hashgraph/green-bonds-shared-core'
import { Type } from 'class-transformer'
import { IsNotEmpty, ValidateNested } from 'class-validator'
import { SecurityTokenCreationRequest } from '../../../../shared/model/SecurityTokenCreationRequest'
import { FactoryRegulationRequest } from '../../../../shared/model/FactoryRegulationRequest'

export class CreateBondTransactionRequest extends BaseTransactionRequest {
  @ValidateNested()
  @Type(() => SecurityTokenCreationRequest)
  @IsNotEmpty()
  securityTokenToCreate: SecurityTokenCreationRequest

  @ValidateNested()
  @Type(() => FactoryRegulationRequest)
  @IsNotEmpty()
  factoryRegulationData: FactoryRegulationRequest
}
