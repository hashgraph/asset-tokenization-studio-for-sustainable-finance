// SPDX-License-Identifier: Apache-2.0

export class EnvironmentalAssetHoldingsResponse {
  readonly createdTimestamp: string
  readonly delegatingSpender: string | null
  readonly deleted: boolean
  readonly metadata: string
  readonly modifiedTimestamp: string
  readonly serialNumber: number
  readonly spenderId: string | null
}
