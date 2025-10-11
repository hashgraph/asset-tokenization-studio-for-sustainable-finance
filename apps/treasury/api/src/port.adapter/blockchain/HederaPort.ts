export interface HederaPort {
  getTokenBalance(tokenId: string, accountId: string): Promise<string>
}
