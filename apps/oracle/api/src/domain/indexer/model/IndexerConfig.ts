// SPDX-License-Identifier: Apache-2.0

/**
 * IndexerConfig Entity
 * Global configuration for the MSG Indexer connection
 */
export class IndexerConfig {
  constructor(
    public readonly id: string,
    public endpoint: string,
    public apiKey: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  updateEndpoint(endpoint: string): void {
    this.endpoint = endpoint
    this.updatedAt = new Date()
  }

  updateApiKey(apiKey: string): void {
    this.apiKey = apiKey
    this.updatedAt = new Date()
  }

  update(endpoint?: string, apiKey?: string): void {
    if (endpoint !== undefined) {
      this.endpoint = endpoint
    }
    if (apiKey !== undefined) {
      this.apiKey = apiKey
    }
    this.updatedAt = new Date()
  }
}
