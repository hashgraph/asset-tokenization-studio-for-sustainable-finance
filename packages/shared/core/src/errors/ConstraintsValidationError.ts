// SPDX-License-Identifier: Apache-2.0

import { ValidationError } from "./ValidationError"

export class ConstraintsValidationError extends ValidationError {
  constructor(errors: string[]) {
    super(errors.join(", "))
  }
}
