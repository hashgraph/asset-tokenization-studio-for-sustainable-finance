// SPDX-License-Identifier: Apache-2.0
export class SchedulerConfig {
  constructor(
    public readonly id: string,
    public cronExpression: string,
    public concurrencyLimit: number,
    public enabled: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  updateCronExpression(cronExpression: string): void {
    this.cronExpression = cronExpression
    this.updatedAt = new Date()
  }

  updateConcurrencyLimit(concurrencyLimit: number): void {
    this.concurrencyLimit = concurrencyLimit
    this.updatedAt = new Date()
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    this.updatedAt = new Date()
  }
}
