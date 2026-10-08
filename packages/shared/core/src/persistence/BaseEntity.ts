// SPDX-License-Identifier: Apache-2.0

export abstract class BaseEntity {
  readonly id: string
  readonly createdAt: Date
  updatedAt: Date
}
