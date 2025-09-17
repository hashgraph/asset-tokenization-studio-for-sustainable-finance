export default interface EventListenerPort {
  subscribe(
    listener: (event: any) => void
  ): void;
  unsubscribe?(): void;
}