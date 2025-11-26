// SPDX-License-Identifier: Apache-2.0

export interface WriteKpiResult {
  transactionHash: string
  success: boolean
}

export interface BlockchainPort {
  /**
   * Write KPI value to the smart contract
   *
   * Note: The smart contract function is addKpiData(uint256 toDate, uint256 kpiValue)
   * It only accepts ONE timestamp (toDate), not a range. The fromDate is used internally
   * by the Oracle for calculation but not sent to the blockchain.
   *
   * @param kpiContractId - The KPI contract address
   * @param projectId - The project identifier
   * @param kpiValue - The aggregated KPI value
   * @param toDate - The measurement date (timestamp when this KPI was recorded)
   */
  writeKpiToContract(kpiContractId: string, projectId: string, kpiValue: number, toDate: Date): Promise<WriteKpiResult>
}
