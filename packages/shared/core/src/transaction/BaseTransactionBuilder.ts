// SPDX-License-Identifier: Apache-2.0

import { ContractExecuteTransaction, Transaction, AccountId, TransactionId, Timestamp } from "@hashgraph/sdk"
import { BaseContract } from "ethers"
import { Environment, getChainIdByNetwork, getHederaClient } from "./Environment"
import { Interface, parseEther, serializeTransaction } from "ethers/lib/utils"
import { TransactionFormat, TransactionParams } from "./model/TransactionParams"
import { TransactionResponse } from "./model/TransactionResponse"

export abstract class BaseTransactionBuilder {
  private readonly formatSerializers: Record<
    TransactionFormat,
    (context: {
      tx: ContractExecuteTransaction
      environment: Environment
      account: string
      contractEvmAddress: string
    }) => TransactionResponse
  > = {
    hedera: ({ tx, environment, account }) => {
      return this.serializeHederaTransaction(tx, environment, account)
    },
    ethereum: ({ tx, environment, contractEvmAddress }) => {
      return this.serializeEvmTransaction(tx, environment, contractEvmAddress)
    },
  }

  protected buildAndSerializeTransaction<
    I extends Interface,
    F extends {
      [K in keyof I]: I[K] extends (...args: any[]) => Promise<any> ? K : never
    }[keyof I],
  >({
    contractInterface,
    functionName,
    contractId,
    gas,
    environment,
    account,
    contractEvmAddress,
    format,
    args,
  }: TransactionParams<I> & {
    functionName: F
    args: Parameters<I[F] extends (...args: infer P) => any ? (...args: P) => any : never>
    format: TransactionFormat
  }): TransactionResponse {
    try {
      const encodedHex = contractInterface.encodeFunctionData(functionName, args)
      const encoded = new Uint8Array(Buffer.from(encodedHex.slice(2), "hex"))

      const tx = new ContractExecuteTransaction().setContractId(contractId).setGas(gas).setFunctionParameters(encoded)

      const serializer = this.formatSerializers[format]
      if (!serializer) {
        throw new Error(`Unsupported format: ${String(format)}`)
      }
      return serializer({ tx, environment, account, contractEvmAddress })
    } catch (error) {
      throw new Error(`Failed to build and serialize transaction: ${(error as Error).message}`)
    }
  }

  protected getEvmAddressFromHedera(hederaAddress: string): string {
    const input = hederaAddress.trim().toLowerCase()
    const id = AccountId.fromString(input)
    return `0x${id.toEvmAddress()}`
  }

  private serializeHederaTransaction(tx: Transaction, environment: Environment, account: string): TransactionResponse {
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

  private serializeEvmTransaction(
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
