export default interface BlockchainEvent {
  timestamp: string
  name: string
  [key: string]: any
}