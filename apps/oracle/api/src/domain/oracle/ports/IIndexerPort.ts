// SPDX-License-Identifier: Apache-2.0

export interface KpiMessage {
  topicId: string;
  projectId: string;
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

export interface IndexerPort {
  /**
   * Fetch KPI messages for a given topic within a date range
   */
  getKpiValuesByTopic(
    topicId: string,
    dateFrom: Date,
    dateTo: Date,
  ): Promise<KpiMessage[]>;
}

export const IndexerPort = Symbol("IndexerPort");
