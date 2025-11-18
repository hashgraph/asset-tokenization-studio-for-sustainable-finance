// SPDX-License-Identifier: Apache-2.0

export interface KpiMessage {
  projectId: string
  value: number
  timestamp: Date
}

export interface IndexerPort {
  /**
   * Get KPI values from the MSG Indexer for a specific topic
   */
  getKpiValuesByTopic(topicId: string, dateFrom?: Date, dateTo?: Date): Promise<KpiMessage[]>
}
