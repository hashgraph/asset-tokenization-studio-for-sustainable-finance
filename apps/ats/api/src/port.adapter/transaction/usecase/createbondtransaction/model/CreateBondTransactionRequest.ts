// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { Type } from "class-transformer"
import { IsNotEmpty, IsString, ValidateNested } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { SecurityTokenCreationRequest } from "../../../../shared/model/SecurityTokenCreationRequest"
import { FactoryRegulationRequest } from "../../../../shared/model/FactoryRegulationRequest"
import { TreasuryRequest } from "@port/shared/model/TreasuryRequest"
import { KpiRequest } from "@port/shared/model/KpiRequest"

export class CreateBondTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "Security token creation parameters",
    type: SecurityTokenCreationRequest,
  })
  @ValidateNested()
  @Type(() => SecurityTokenCreationRequest)
  @IsNotEmpty()
  securityTokenToCreate: SecurityTokenCreationRequest

  @ApiProperty({
    description: "Factory regulation data",
    type: FactoryRegulationRequest,
  })
  @ValidateNested()
  @Type(() => FactoryRegulationRequest)
  @IsNotEmpty()
  factoryRegulationData: FactoryRegulationRequest

  @ApiProperty({
    description: "Treasury configuration",
    type: TreasuryRequest,
  })
  @ValidateNested()
  @Type(() => TreasuryRequest)
  @IsNotEmpty()
  treasuryData: TreasuryRequest

  @ApiProperty({
    description: "KPI configuration",
    type: KpiRequest,
  })
  @ValidateNested()
  @Type(() => KpiRequest)
  @IsNotEmpty()
  kpiData: KpiRequest

  @ApiProperty({
    description: "Factory EVM address",
    example: "0x1234567890123456789012345678901234567890",
  })
  @IsString()
  @IsNotEmpty()
  factoryAddress: string
}
