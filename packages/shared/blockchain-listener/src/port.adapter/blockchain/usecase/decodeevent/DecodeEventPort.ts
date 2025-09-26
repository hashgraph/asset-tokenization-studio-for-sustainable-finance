// SPDX-License-Identifier: Apache-2.0

import DecodeLogRequest from "./requests/DecodeLogRequest"
import DecodeLogResponse from "./responses/DecodeLogResponse"

export default interface DecodeEventPort {
  decodeLog(request: DecodeLogRequest): DecodeLogResponse
}
