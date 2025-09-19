// SPDX-License-Identifier: Apache-2.0

import { IsIn } from "class-validator"
import { SignedTransactionMessage } from "./SignedTransactionMessage"

export class SignedTransactionWithFormat extends SignedTransactionMessage {
  @IsIn(["hedera", "ethereum"])
  format: string
}
