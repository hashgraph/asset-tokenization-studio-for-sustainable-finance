export default interface BlockchainEvent {
  timestamp: string
  transactionHash: string
  name: string
  signature: string
  [key: string]: any
}
