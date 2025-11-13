// SPDX-License-Identifier: Apache-2.0
export interface BondDocumentDto {
  name: string
  uri: string
  hash: string
}

export interface BondDocumentsQueryResponse {
  documents: BondDocumentDto[]
}
