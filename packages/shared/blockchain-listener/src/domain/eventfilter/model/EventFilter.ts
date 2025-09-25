// SPDX-License-Identifier: Apache-2.0

import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsHexadecimal, IsNotEmpty } from "class-validator"

export class EventFilter extends BaseEntity {
  @IsNotEmpty()
  @IsHexadecimal()
  contractAddress: string

  @IsNotEmpty()
  eventName: string

  @IsNotEmpty()
  eventSignature: string
}
