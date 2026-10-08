// SPDX-License-Identifier: Apache-2.0

export interface HederaPort {
  getTokenBalance(tokenId: string, accountId: string): Promise<string>
  getTokenDecimals(tokenId: string): Promise<number>
}
