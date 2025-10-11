// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from '@hashgraph/green-bonds-shared-core'
import { Type } from 'class-transformer'
import { IsNotEmpty, ValidateNested } from 'class-validator'
import { SecurityTokenCreationRequest } from '../../../../shared/model/SecurityTokenCreationRequest'
import { FactoryRegulationRequest } from '../../../../shared/model/FactoryRegulationRequest'
import { TreasuryRequest } from '@port/shared/model/TreasuryRequest'
import { KpiRequest } from '@port/shared/model/KpiRequest'

export class CreateBondTransactionRequest extends BaseTransactionRequest {
  @ValidateNested()
  @Type(() => SecurityTokenCreationRequest)
  @IsNotEmpty()
  securityTokenToCreate: SecurityTokenCreationRequest

  @ValidateNested()
  @Type(() => FactoryRegulationRequest)
  @IsNotEmpty()
  factoryRegulationData: FactoryRegulationRequest

  @ValidateNested()
  @Type(() => TreasuryRequest)
  @IsNotEmpty()
  treasuryData: TreasuryRequest

  @ValidateNested()
  @Type(() => KpiRequest)
  @IsNotEmpty()
  kpiData: KpiRequest
}
