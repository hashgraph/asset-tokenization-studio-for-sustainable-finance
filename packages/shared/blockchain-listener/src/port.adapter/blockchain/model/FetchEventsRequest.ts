// SPDX-License-Identifier: Apache-2.0

import { IsDefined, IsNotEmpty, ValidateNested } from "class-validator"
import { ContractEventRequest } from "@port/blockchain/model/ContractEventRequest"

export class FetchEventsRequest {
  @IsDefined()
  blockNumber: number

  @IsNotEmpty()
  logsBloom: string

  @ValidateNested({ each: true })
  contractEvents: ContractEventRequest[]
}
