// SPDX-License-Identifier: Apache-2.0
import { Injectable, Logger } from "@nestjs/common";
import { IndexerPort, KpiMessage } from "@domain/oracle/ports/IndexerPort";

@Injectable()
export class IndexerApiClient implements IndexerPort {
  private readonly logger = new Logger(IndexerApiClient.name);
  private readonly endpoint: string;
  private readonly apiKey: string;

  constructor() {
    this.endpoint = process.env.INDEXER_ENDPOINT || "";
    this.apiKey = process.env.INDEXER_API_KEY || "";

    if (!this.endpoint) {
      this.logger.warn("INDEXER_ENDPOINT not configured");
    }
  }

  async getKpiValuesByTopic(
    topicId: string,
    dateFrom: Date,
    dateTo: Date,
  ): Promise<KpiMessage[]> {
    this.logger.log(
      `Fetching KPI messages for topic ${topicId} from ${dateFrom.toISOString()} to ${dateTo.toISOString()}`,
    );

    try {
      const url = `${this.endpoint}/messages?topicId=${topicId}&from=${dateFrom.toISOString()}&to=${dateTo.toISOString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Indexer API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      // Transform API response to KpiMessage[]
      // This structure depends on the actual MSG Indexer API response format
      // Adjust according to the real API
      const messages: KpiMessage[] = (data.messages || []).map((msg: any) => ({
        topicId: msg.topicId || topicId,
        projectId: msg.projectId || "",
        timestamp: new Date(msg.timestamp),
        value: parseFloat(msg.value || msg.kpiValue || "0"),
        metadata: msg.metadata || {},
      }));

      this.logger.log(`Retrieved ${messages.length} KPI messages`);

      return messages;
    } catch (error) {
      this.logger.error(
        `Failed to fetch KPI messages: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }
}
