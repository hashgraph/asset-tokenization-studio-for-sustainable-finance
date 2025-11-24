// SPDX-License-Identifier: Apache-2.0
import { IndexerConfig } from "@domain/indexer/model/IndexerConfig"

export class IndexerConfigResponse {
  id: string
  endpoint: string
  apiKey: string
  createdAt: Date
  updatedAt: Date

  static fromDomain(config: IndexerConfig): IndexerConfigResponse {
    const response = new IndexerConfigResponse()
    response.id = config.id
    response.endpoint = config.endpoint
    // Mask API key for security - only show last 4 characters
    response.apiKey = config.apiKey ? `****${config.apiKey.slice(-4)}` : ""
    response.createdAt = config.createdAt
    response.updatedAt = config.updatedAt
    return response
  }
}
