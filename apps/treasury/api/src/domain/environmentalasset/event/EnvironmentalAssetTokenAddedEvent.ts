// SPDX-License-Identifier: Apache-2.0

export class EnvironmentalAssetTokenAddedEvent {
  readonly environmentalAssetId: string
  readonly tokenId: number
  readonly timestamp: number

  constructor(environmentalAssetId: string, tokenId: number) {
    this.environmentalAssetId = environmentalAssetId
    this.tokenId = tokenId
    this.timestamp = Date.now()
  }
}
