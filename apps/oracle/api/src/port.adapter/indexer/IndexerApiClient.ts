// SPDX-License-Identifier: Apache-2.0
import { Inject, Injectable, Logger } from "@nestjs/common"
import { IndexerPort, KpiMessage } from "@domain/oracle/ports/IndexerPort"
import type { IndexerConfigRepository } from "@domain/indexer/repositories/IndexerConfigRepository"

@Injectable()
export class IndexerApiClient implements IndexerPort {
  private readonly logger = new Logger(IndexerApiClient.name)

  constructor(
    @Inject("IndexerConfigRepository")
    private readonly configRepository: IndexerConfigRepository,
  ) {}

  async getKpiValueByTopic(topicId: string, dateFrom: Date, dateTo: Date): Promise<KpiMessage | null> {
    this.logger.log(`Fetching KPI value for topic ${topicId} from ${dateFrom.toISOString()} to ${dateTo.toISOString()}`)

    // Get config from database (or create with env defaults)
    const config = await this.configRepository.getOrCreateDefault()

    if (!config.endpoint) {
      this.logger.warn("Indexer endpoint not configured")
      return null
    }

    try {
      const url = `${config.endpoint}/messages?topicId=${topicId}&from=${dateFrom.toISOString()}&to=${dateTo.toISOString()}`

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Indexer API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Transform API response to single KpiMessage (most recent)
      // This structure depends on the actual MSG Indexer API response format
      // Adjust according to the real API
      const messages = data.messages || []

      if (messages.length === 0) {
        this.logger.log(`No KPI messages found for topic ${topicId}`)
        return null
      }

      // Return the most recent message (assuming API returns sorted by timestamp desc)
      const latestMsg = messages[0]
      const kpiMessage: KpiMessage = {
        projectId: latestMsg.projectId || "",
        timestamp: new Date(latestMsg.timestamp),
        value: parseFloat(latestMsg.value || latestMsg.kpiValue || "0"),
      }

      this.logger.log(`Retrieved KPI value: ${kpiMessage.value} for topic ${topicId}`)

      return kpiMessage
    } catch (error) {
      this.logger.error(`Failed to fetch KPI value: ${error instanceof Error ? error.message : "Unknown error"}`)
      throw error
    }
  }
}
