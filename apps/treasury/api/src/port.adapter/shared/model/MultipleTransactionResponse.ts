// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "MultipleTransaction" })
export class MultipleTransactionResponse {
  @ApiProperty({
    description: "List of unsigned transaction bytes in hexadecimal",
    example: "[0xe6808083e4e1c094d01e554d8e8327c44bc6ce7419c44a6fd829c31980848456cb598201288080]",
  })
  items: string[]
}
