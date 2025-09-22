export default interface BlockchainEvent {
  timestamp: string
  name: string
  signature: string
  [key: string]: any
}
