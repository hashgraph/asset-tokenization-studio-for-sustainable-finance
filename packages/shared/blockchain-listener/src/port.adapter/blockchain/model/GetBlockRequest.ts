// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty } from "class-validator"

export class GetBlockRequest {
  @IsNotEmpty()
  readonly blockNumber: string
}
