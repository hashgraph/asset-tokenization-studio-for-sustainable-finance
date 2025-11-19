// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { KpiMessage } from "../ports/IndexerPort"

/**
 * OracleAggregationService
 * Domain service responsible for aggregating KPI values
 */
//TODO: Guardian platform integration
@Injectable()
export class OracleAggregationService {
  /**
   * Aggregate KPI messages into a single daily value
   * Strategy: Sum all values for the day
   */
  aggregateDailyKpi(messages: KpiMessage[]): number {
    if (messages.length === 0) {
      return 0
    }

    const total = messages.reduce((sum, msg) => sum + msg.value, 0)
    return total
  }

  /**
   * Alternative: Calculate average KPI value
   */
  calculateAverageKpi(messages: KpiMessage[]): number {
    if (messages.length === 0) {
      return 0
    }

    const total = this.aggregateDailyKpi(messages)
    return total / messages.length
  }

  /**
   * Filter messages for a specific date
   */
  filterMessagesByDate(messages: KpiMessage[], targetDate: Date): KpiMessage[] {
    const target = this.normalizeDate(targetDate)
    return messages.filter((msg) => {
      const msgDate = this.normalizeDate(msg.timestamp)
      return msgDate.getTime() === target.getTime()
    })
  }

  /**
   * Normalize date to midnight UTC
   */
  private normalizeDate(date: Date): Date {
    const normalized = new Date(date)
    normalized.setUTCHours(0, 0, 0, 0)
    return normalized
  }
}
