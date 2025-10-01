// SPDX-License-Identifier: Apache-2.0

import { ContractExecuteTransaction, Transaction, AccountId, TransactionId, Timestamp } from "@hashgraph/sdk"
import { BaseContract } from "ethers"
import { Environment, getChainIdByNetwork, getHederaClient } from "./Environment"
import { parseEther, serializeTransaction } from "ethers/lib/utils"
import { TransactionParams } from "./model/TransactionParams"
import { TransactionResponse } from "./model/TransactionResponse"

export abstract class BaseTransactionBuilder {
  protected buildTransaction<
    C extends BaseContract,
    F extends {
      [K in keyof C]: C[K] extends (...args: any[]) => Promise<any> ? K : never
    }[keyof C] &
      string,
  >({
    contractInstance,
    functionName,
    contractId,
    gas,
    args,
  }: TransactionParams<C> & {
    functionName: F
    args: Parameters<C[F] extends (...args: infer P) => any ? (...args: P) => any : never>
  }): ContractExecuteTransaction {
    try {
      const encodedHex = contractInstance.interface.encodeFunctionData(functionName, args)
      const encoded = new Uint8Array(Buffer.from(encodedHex.slice(2), "hex"))

      const tx = new ContractExecuteTransaction().setContractId(contractId).setGas(gas).setFunctionParameters(encoded)

      return tx
    } catch (error) {
      throw new Error(`Failed to build transaction: ${(error as Error).message}`)
    }
  }

  protected serializeHederaTransaction(
    tx: Transaction,
    environment: Environment,
    account: string,
  ): TransactionResponse {
    try {
      const accountId = AccountId.fromString(account)
      const txId = TransactionId.withValidStart(accountId, Timestamp.fromDate(new Date()))

      tx.setTransactionId(txId).setTransactionValidDuration(180)

      const client = getHederaClient(environment)
      const unsignedTx = Buffer.from(tx.freezeWith(client).toBytes()).toString("hex")

      return new TransactionResponse(unsignedTx)
    } catch (error) {
      throw new Error(`Failed to serialize Hedera transaction: ${(error as Error).message}`)
    }
  }

  protected serializeEvmTransaction(
    tx: ContractExecuteTransaction,
    environment: Environment,
    contractEvmAddress: string,
  ): TransactionResponse {
    try {
      if (!tx.functionParameters) {
        throw new Error("Function parameters are missing")
      }

      const evmTxData = {
        to: contractEvmAddress,
        data: "0x" + Buffer.from(tx.functionParameters).toString("hex"),
        value: parseEther("0"),
        gasLimit: tx.gas.toNumber(),
        chainId: getChainIdByNetwork(environment),
      }
      const unsignedTx = serializeTransaction(evmTxData)
      return new TransactionResponse(unsignedTx)
    } catch (error) {
      throw new Error(`Failed to serialize EVM transaction: ${(error as Error).message}`)
    }
  }
}
