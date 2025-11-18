// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, Matches } from "class-validator"
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"

export class ReclaimHoldRequest extends BaseTransactionRequest {
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[0-9a-fA-F]{64}$/, { message: "partition must be a 32-byte hex string (0x followed by 64 hex characters)" })
  partition: string
}
