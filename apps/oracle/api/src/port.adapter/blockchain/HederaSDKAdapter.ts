// SPDX-License-Identifier: Apache-2.0
import { Injectable, Logger } from "@nestjs/common";
import {
  BlockchainPort,
  WriteKpiResult,
} from "@domain/oracle/ports/BlockchainPort";
import {
  Client,
  PrivateKey,
  AccountId,
  ContractExecuteTransaction,
  ContractFunctionParameters,
} from "@hashgraph/sdk";

@Injectable()
export class HederaSDKAdapter implements BlockchainPort {
  private readonly logger = new Logger(HederaSDKAdapter.name);
  private client: Client;
  private operatorAccountId: AccountId;
  private operatorPrivateKey: PrivateKey;

  constructor() {
    const network = process.env.HEDERA_NETWORK || "testnet";
    const accountIdStr = process.env.ACCOUNT_ID || "";
    const privateKeyStr = process.env.PRIVATE_KEY || "";

    if (!accountIdStr || !privateKeyStr) {
      throw new Error("ACCOUNT_ID and PRIVATE_KEY must be set");
    }

    this.operatorAccountId = AccountId.fromString(accountIdStr);
    this.operatorPrivateKey = PrivateKey.fromStringED25519(privateKeyStr);

    // Initialize client based on network
    if (network === "mainnet") {
      this.client = Client.forMainnet();
    } else if (network === "previewnet") {
      this.client = Client.forPreviewnet();
    } else {
      this.client = Client.forTestnet();
    }

    this.client.setOperator(this.operatorAccountId, this.operatorPrivateKey);

    this.logger.log(
      `HederaSDKAdapter initialized for ${network} with account ${accountIdStr}`,
    );
  }

  async writeKpiToContract(
    kpiContractId: string,
    projectId: string,
    kpiValue: number,
    date: Date,
  ): Promise<WriteKpiResult> {
    this.logger.log(
      `Writing KPI to contract ${kpiContractId} for project ${projectId}: ${kpiValue}`,
    );

    try {
      // Prepare function parameters
      // Assuming the KPI contract has a function like:
      // writeKpi(string projectId, uint256 kpiValue, uint256 timestamp)
      const functionParams = new ContractFunctionParameters()
        .addString(projectId)
        .addUint256(Math.floor(kpiValue * 1000000)) // Convert to fixed point if needed
        .addUint256(Math.floor(date.getTime() / 1000)); // Unix timestamp

      // Execute contract function
      const transaction = new ContractExecuteTransaction()
        .setContractId(kpiContractId)
        .setGas(500000) // Adjust gas as needed
        .setFunction("writeKpi", functionParams);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      if (receipt.status.toString() !== "SUCCESS") {
        throw new Error(`Transaction failed with status: ${receipt.status}`);
      }

      const transactionHash = txResponse.transactionId.toString();

      this.logger.log(
        `Successfully wrote KPI to contract. TX: ${transactionHash}`,
      );

      return {
        transactionHash,
        success: true,
      };
    } catch (error) {
      this.logger.error(
        `Failed to write KPI to contract: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  onModuleDestroy() {
    this.client.close();
  }
}
