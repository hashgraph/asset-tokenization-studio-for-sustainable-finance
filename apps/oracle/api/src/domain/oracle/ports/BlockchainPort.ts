// SPDX-License-Identifier: Apache-2.0

export interface WriteKpiResult {
  transactionHash: string
  success: boolean
}

export interface BlockchainPort {
  /**
   * Write KPI value to the smart contract
   * @param kpiContractId - The KPI contract address
   * @param projectId - The project identifier
   * @param kpiValue - The aggregated KPI value
   * @param fromDate - Start of the measurement period (null for first execution)
   * @param toDate - End of the measurement period
   */
  writeKpiToContract(
    kpiContractId: string,
    projectId: string,
    kpiValue: number,
    fromDate: Date | null,
    toDate: Date,
  ): Promise<WriteKpiResult>
}
