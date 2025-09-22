// SPDX-License-Identifier: Apache-2.0

import { Singleton, Logger } from "@hashgraph/green-bonds-shared-core"
import DecodeEventPort from "./DecodeEventPort"
import BlockchainEvent from "@domain/event/BlockchainEvent.js"
import Log from "@domain/blockchain/Log.js"
import { utils } from "ethers";

@Singleton()
export default class DecodeEventAdapter implements DecodeEventPort {
  private readonly logger = new Logger(DecodeEventAdapter.name)

  private readonly eventSignatureHashes

  constructor() {
    this.eventSignatureHashes = new Map<string, string>(
      this.splitFunctions(process.env.BLOCKCHAIN_LISTENER_EVENTS ?? "")
      .map(eventSignature => [utils.id(eventSignature), eventSignature])
    );
  }

  decode(log: Log): BlockchainEvent {
    try {
      if (!log.data || log.data === "0x") {
        return
      }

      const eventSignature = this.eventSignatureHashes.get(log.topics[0])
      if (!eventSignature) return null;

      const {name, types} = this.parseEventSignature(eventSignature)
      const decodedValues = utils.defaultAbiCoder.decode(types, log.data)

      const eventObj: BlockchainEvent = {
        timestamp: log.timestamp,
        transactionHash: log.transactionHash,
        name,
        signature: eventSignature
      };

      types.forEach((type, idx) => {
        eventObj[`param${idx}`] = decodedValues[idx];
      });

      return eventObj;

    } catch (error) {
      throw new Error(`Error decoding log.\n${JSON.stringify(log, null, 2)}`, error)
    }
  }

  private splitFunctions(input: string): string[] {
    const result: string[] = [];
    let current = "";
    let depth = 0;

    for (const char of input) {
      if (char === "(") {
        depth++;
        current += char;
      } else if (char === ")") {
        depth--;
        current += char;
      } else if (char === "," && depth === 0) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    if (current.trim() !== "") {
      result.push(current.trim());
    }

    return result;
  }

  private parseEventSignature(eventSignature: string): { name: string; types: string[] } {
    const match = eventSignature.match(/^([^(]+)\((.*)\)$/);
    if (!match) {
      throw new Error("Invalid event signature: " + eventSignature);
    }

    const [, name, params] = match;

    function parseParams(paramStr: string): string[] {
      const types: string[] = [];
      let current = "";
      let depth = 0;

      for (const char of paramStr) {
        if (char === "(") {
          if (depth > 0) current += char;
          depth++;
        } else if (char === ")") {
          depth--;
          if (depth > 0) {
            current += char;
          } else {
            types.push(...parseParams(current));
            current = "";
          }
        } else if (char === "," && depth === 0) {
          if (current.trim().length > 0) {
            types.push(current.trim());
          }
          current = "";
        } else {
          current += char;
        }
      }

      if (current.trim().length > 0) {
        types.push(current.trim());
      }

      return types;
    }

    const types = params.trim() ? parseParams(params) : [];

    return { name, types };
  }
}