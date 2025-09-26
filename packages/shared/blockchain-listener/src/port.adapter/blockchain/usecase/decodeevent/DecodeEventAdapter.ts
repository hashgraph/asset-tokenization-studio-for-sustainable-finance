// SPDX-License-Identifier: Apache-2.0

import { Singleton, Logger } from "@hashgraph/green-bonds-shared-core"
import DecodeEventPort from "./DecodeEventPort"
import DecodeLogRequest from "./requests/DecodeLogRequest"
import DecodeLogResponse from "./responses/DecodeLogResponse"
import { utils } from "ethers"
import { Interface } from "ethers/lib/utils"

@Singleton()
export default class DecodeEventAdapter implements DecodeEventPort {
  private readonly logger = new Logger(DecodeEventAdapter.name)

  private readonly INDEXED_PARAMS_PATTERN = /\s*indexed*/g
  private readonly EVENT_NAME_PATTERN = /^([^(]+)\((.*)\)$/

  private readonly eventSignatureHashes

  constructor() {
    this.eventSignatureHashes = new Map<string, string>(
      this.splitFunctions(process.env.BLOCKCHAIN_LISTENER_EVENTS ?? "").map((eventSignature) => [
        utils.id(this.normalizeEventSignature(eventSignature)),
        eventSignature,
      ]),
    )
  }

  decodeLog(request: DecodeLogRequest): DecodeLogResponse {
    try {
      if (!request.data || request.data === "0x") {
        return
      }

      const eventSignature: string = this.eventSignatureHashes.get(request.topics[0])
      if (!eventSignature) return null
      const eventName: string = this.getEventName(eventSignature)
      const decodedValues = this.decodeEventParams(eventSignature, request.data, request.topics)

      const result = Object.keys(decodedValues)
        .filter((key) => isNaN(Number(key)))
        .map((key) => ({ name: key, value: decodedValues[key] }))

      const eventObj: DecodeLogResponse = {
        logTimestamp: request.timestamp,
        transactionHash: request.transactionHash,
        name: eventName,
        signature: eventSignature,
      } as DecodeLogResponse

      result.forEach((param) => {
        eventObj[param.name] = param.value.toString()
      })

      return eventObj
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error(`Error decoding log.\n${JSON.stringify(request, null, 2)}`)
    }
  }

  private decodeEventParams(eventSignature: string, data: string, topics: string[]) {
    const iface = new Interface([`event ${eventSignature}`])
    const parsed = iface.parseLog({
      data: data,
      topics: topics,
    })
    return parsed.args
  }

  private normalizeEventSignature(signature: string): string {
    const [name, params] = signature.split("(")
    const types = params
      .replace(")", "")
      .split(",")
      .map((p) => p.trim())
      .map((p) => p.replace(this.INDEXED_PARAMS_PATTERN, ""))
      .map((p) => p.split(" ")[0])
    return `${name}(${types.join(",")})`
  }

  private splitFunctions(input: string): string[] {
    const result: string[] = []
    let current = ""
    let depth = 0

    for (const char of input) {
      if (char === "(") {
        depth++
        current += char
      } else if (char === ")") {
        depth--
        current += char
      } else if (char === "," && depth === 0) {
        result.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }

    if (current.trim() !== "") {
      result.push(current.trim())
    }

    return result
  }

  private getEventName(eventSignature: string): string {
    const match = eventSignature.match(this.EVENT_NAME_PATTERN)
    if (!match) {
      throw new Error("Invalid event signature: " + eventSignature)
    }
    return match[1]
  }
}
