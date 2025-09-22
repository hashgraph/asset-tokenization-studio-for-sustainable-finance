export default interface Event {
  timestamp: string
  name: string
  signature: string
  [key: string]: any
}
