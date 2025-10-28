// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsNumberString, NotEquals } from "class-validator"

export class SyncProceedsRecipientAppServiceRequest {
  @IsNotEmpty()
  treasuryContractId: string

  @IsNotEmpty()
  proceedsRecipientContractId: string

  @NotEquals("0")
  @IsNumberString({ no_symbols: true })
  amount: string
}
