// SPDX-License-Identifier: Apache-2.0

export class ExecutionHistoryQueryResponse {
  id: string
  oracleRegistryId: string
  projectId: string
  status: string
  fromDate: Date | null
  toDate: Date
  executionTime: Date
  completedAt: Date | null
  errorType: string | null
  errorMessage: string | null
  kpiValue: number | null
  transactionHash: string | null
  retryCount: number
  createdAt: Date
  updatedAt: Date
}
