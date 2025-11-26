// SPDX-License-Identifier: Apache-2.0

export interface KpiMessage {
  projectId: string
  value: number
  timestamp: Date
}

export interface IndexerPort {
  /**
   * Get KPI value from the MSG Indexer for a specific topic
   * Returns the most recent KPI value within the date range, or null if not found
   */
  getKpiValueByTopic(topicId: string, dateFrom?: Date, dateTo?: Date): Promise<KpiMessage | null>
}
