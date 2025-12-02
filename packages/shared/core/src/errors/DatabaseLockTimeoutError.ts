// SPDX-License-Identifier: Apache-2.0

import { CustomError } from "./CustomError"

export class DatabaseLockTimeoutError extends CustomError {
  static readonly ERROR_CODE: string = "55P03"

  constructor(message: string) {
    super(`Database lock timeout error: ${message}`)
  }
}
