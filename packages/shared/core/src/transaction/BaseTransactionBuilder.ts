// SPDX-License-Identifier: Apache-2.0

import { ContractExecuteTransaction, Transaction, AccountId, TransactionId, Timestamp } from "@hashgraph/sdk"
import { Environment, getChainIdByNetwork, getHederaClient } from "./Environment"
import { Interface, parseEther, serializeTransaction } from "ethers/lib/utils"
import { TransactionFormat, TransactionParams } from "./model/TransactionParams"
import { TransactionResponse } from "./model/TransactionResponse"
import { ConverterUtils } from "@utils/ConverterUtils"
import { BuildGrantRoleTransactionRequest } from "@transaction/model/BuildGrantRoleTransactionRequest"
import { BuildTransactionResponse } from "@transaction/model/BuildTransactionResponse"
import { IAccessControl__factory, IPause__factory } from "@hashgraph/green-bonds-platform-treasury-contracts"
import { BaseTransactionBuilderPort } from "@transaction/BaseTransactionBuilderPort"
import { BuildPauseTransactionRequest } from "@transaction/model/BuildPauseTransactionRequest"
import { BuildUnpauseTransactionRequest } from "@transaction/model/BuildUnpauseTransactionRequest"

export abstract class BaseTransactionBuilder implements BaseTransactionBuilderPort {
  protected readonly GAS = 15_000_000

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

  async grantRole(request: BuildGrantRoleTransactionRequest): Promise<BuildTransactionResponse> {
    return await this.buildAndSerializeTransaction({
      contractInterface: IAccessControl__factory.createInterface(),
      functionName: "grantRole" as any,
      contractId: request.contractId,
      gas: this.GAS,
      environment: this.getEnvironment(),
      account: request.accountId,
      format: request.format as "hedera" | "ethereum",
      args: [request.roleId, await ConverterUtils.getEvmAddressFromHederaAddress(request.userAccountId)],
    } as any)
  }

  async revokeRole(request: BuildGrantRoleTransactionRequest): Promise<BuildTransactionResponse> {
    return await this.buildAndSerializeTransaction({
      contractInterface: IAccessControl__factory.createInterface(),
      functionName: "revokeRole" as any,
      contractId: request.contractId,
      gas: this.GAS,
      environment: this.getEnvironment(),
      account: request.accountId,
      format: request.format as "hedera" | "ethereum",
      args: [request.roleId, await ConverterUtils.getEvmAddressFromHederaAddress(request.userAccountId)],
    } as any)
  }

  async pause(request: BuildPauseTransactionRequest): Promise<BuildTransactionResponse> {
    return await this.buildAndSerializeTransaction({
      contractInterface: IPause__factory.createInterface(),
      functionName: "pause" as any,
      contractId: request.contractId,
      gas: this.GAS,
      environment: this.getEnvironment(),
      account: request.accountId,
      format: request.format as "hedera" | "ethereum",
      args: [],
    } as any)
  }

  async unpause(request: BuildUnpauseTransactionRequest): Promise<BuildTransactionResponse> {
    return await this.buildAndSerializeTransaction({
      contractInterface: IPause__factory.createInterface(),
      functionName: "unpause" as any,
      contractId: request.contractId,
      gas: this.GAS,
      environment: this.getEnvironment(),
      account: request.accountId,
      format: request.format as "hedera" | "ethereum",
      args: [],
    } as any)
  }

  protected async buildAndSerializeTransaction<
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
    format,
    args,
  }: TransactionParams<I> & {
    functionName: F
    args: Parameters<I[F] extends (...args: infer P) => any ? (...args: P) => any : never>
    format: TransactionFormat
  }): Promise<TransactionResponse> {
    try {
      const encodedHex = contractInterface.encodeFunctionData(functionName, args)
      const encoded = new Uint8Array(Buffer.from(encodedHex.slice(2), "hex"))

      const tx = new ContractExecuteTransaction().setContractId(contractId).setGas(gas).setFunctionParameters(encoded)

      const contractEvmAddress =
        format === "ethereum" ? await ConverterUtils.getEvmAddressFromHederaAddress(contractId) : ""

      const serializer = this.formatSerializers[format]
      if (!serializer) {
        throw new Error(`Unsupported format: ${String(format)}`)
      }
      return serializer({ tx, environment, account, contractEvmAddress })
    } catch (error) {
      throw new Error(`Failed to build and serialize transaction: ${(error as Error).message}`)
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

  protected getEnvironment(): Environment {
    return <Environment>process.env.HEDERA_NETWORK || "testnet"
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
