// SPDX-License-Identifier: Apache-2.0

export class BondDocumentDto {
  name: string
  uri: string
  hash: string
}

export class BondDocumentsResponse {
  documents: BondDocumentDto[]
}
