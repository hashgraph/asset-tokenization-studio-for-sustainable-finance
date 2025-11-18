// SPDX-License-Identifier: Apache-2.0
import { Injectable, Logger } from "@nestjs/common";
import {
  BlockchainPort,
  WriteKpiResult,
} from "@domain/oracle/ports/BlockchainPort";

@Injectable()
export class HederaJsonRpcAdapter implements BlockchainPort {
  private readonly logger = new Logger(HederaJsonRpcAdapter.name);
  private readonly rpcEndpoint: string;
  private readonly privateKey: string;
  private readonly accountId: string;

  constructor() {
    this.rpcEndpoint = process.env.RPC_ENDPOINT || "";
    this.privateKey = process.env.PRIVATE_KEY || "";
    this.accountId = process.env.ACCOUNT_ID || "";

    if (!this.rpcEndpoint || !this.privateKey || !this.accountId) {
      throw new Error(
        "RPC_ENDPOINT, PRIVATE_KEY, and ACCOUNT_ID must be set for JSON-RPC adapter",
      );
    }

    this.logger.log(
      `HederaJsonRpcAdapter initialized with endpoint ${this.rpcEndpoint}`,
    );
  }

  async writeKpiToContract(
    kpiContractId: string,
    projectId: string,
    kpiValue: number,
    date: Date,
  ): Promise<WriteKpiResult> {
    this.logger.log(
      `Writing KPI to contract ${kpiContractId} for project ${projectId}: ${kpiValue} (via JSON-RPC)`,
    );

    try {
      // Encode function call
      // This is a simplified example - you'll need to properly encode the function call
      // using ethers.js or similar library for ABI encoding
      const functionSelector = this.getFunctionSelector("writeKpi(string,uint256,uint256)");
      const encodedParams = this.encodeParameters(
        projectId,
        Math.floor(kpiValue * 1000000),
        Math.floor(date.getTime() / 1000),
      );

      const callData = functionSelector + encodedParams;

      // Build JSON-RPC request
      const request = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "eth_sendRawTransaction",
        params: [
          {
            from: this.accountId,
            to: kpiContractId,
            data: callData,
            gas: "0x7A120", // 500000 in hex
          },
        ],
      };

      const response = await fetch(this.rpcEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`RPC request failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(`RPC error: ${result.error.message}`);
      }

      const transactionHash = result.result;

      this.logger.log(
        `Successfully wrote KPI to contract via JSON-RPC. TX: ${transactionHash}`,
      );

      return {
        transactionHash,
        success: true,
      };
    } catch (error) {
      this.logger.error(
        `Failed to write KPI via JSON-RPC: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  private getFunctionSelector(signature: string): string {
    // Simple implementation - in production, use proper keccak256 hashing
    // This is a placeholder
    return "0x12345678"; // First 4 bytes of keccak256(signature)
  }

  private encodeParameters(
    projectId: string,
    kpiValue: number,
    timestamp: number,
  ): string {
    // Simplified encoding - in production, use ethers.js AbiCoder
    // This is a placeholder
    return "0x" + Buffer.from(projectId).toString("hex") +
      kpiValue.toString(16).padStart(64, "0") +
      timestamp.toString(16).padStart(64, "0");
  }
}
