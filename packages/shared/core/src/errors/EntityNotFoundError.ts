// SPDX-License-Identifier: Apache-2.0

import { DomainError } from "./DomainError"

export abstract class EntityNotFoundError extends DomainError {
  protected constructor(message: string) {
    super(message)
  }
}
