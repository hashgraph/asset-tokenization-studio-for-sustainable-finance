// SPDX-License-Identifier: Apache-2.0

import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, NotEquals } from "class-validator"

export class ProceedsRecipientAllocation extends BaseEntity {
  @IsNotEmpty()
  proceedsRecipientId: string

  @IsNotEmpty()
  paymentTokenId: string

  @NotEquals("0")
  @IsNumberString({ no_symbols: true })
  amount: string
}
