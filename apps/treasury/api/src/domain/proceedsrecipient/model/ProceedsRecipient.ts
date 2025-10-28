// SPDX-License-Identifier: Apache-2.0

import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty } from "class-validator"

export class ProceedsRecipient extends BaseEntity {
  @IsNotEmpty()
  contractId: string

  @IsNotEmpty()
  treasuryId: string
}
