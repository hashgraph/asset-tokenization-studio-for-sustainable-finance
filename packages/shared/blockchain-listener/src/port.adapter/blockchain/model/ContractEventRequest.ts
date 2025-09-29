// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty } from "class-validator"

export class ContractEventRequest {
  @IsNotEmpty()
  readonly contractAddress: string

  @IsNotEmpty()
  readonly eventSignature: string
}
