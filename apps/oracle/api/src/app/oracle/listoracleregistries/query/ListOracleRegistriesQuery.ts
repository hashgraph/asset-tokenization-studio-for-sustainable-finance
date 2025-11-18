// SPDX-License-Identifier: Apache-2.0

export class ListOracleRegistriesQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
