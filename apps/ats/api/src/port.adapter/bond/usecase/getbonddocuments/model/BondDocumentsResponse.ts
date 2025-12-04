// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "BondDocument" })
export class BondDocumentResponse {
  @ApiProperty({ description: "Name of the document", example: "Prospectus.pdf" })
  name: string

  @ApiProperty({ description: "URI of the document", example: "https://example.com/documents/prospectus.pdf" })
  uri: string

  @ApiProperty({ description: "Hash of the document", example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" })
  hash: string
}
