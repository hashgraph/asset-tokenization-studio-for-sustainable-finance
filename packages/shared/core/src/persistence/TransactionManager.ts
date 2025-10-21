// SPDX-License-Identifier: Apache-2.0
export interface TransactionManager {
  /**
   * Executes the given work function within a database transaction.
   * If the work function throws an error, the transaction is rolled back.
   * Otherwise, the transaction is committed.
   *
   * @param work The function to execute within the transaction
   * @returns The result of the work function
   */
  execute<T>(work: () => Promise<T>): Promise<T>
}
