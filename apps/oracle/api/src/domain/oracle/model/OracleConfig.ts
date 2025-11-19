// SPDX-License-Identifier: Apache-2.0

/**
 * OracleConfig Value Object
 * Encapsulates scheduler configuration
 */
export class OracleConfig {
  constructor(
    public readonly schedulerStartDate: Date,
    public readonly schedulerEndDate: Date | null,
    public readonly nextExecutionDate: Date,
    public readonly frequencyMinutes: number,
  ) {
    if (schedulerStartDate > nextExecutionDate) {
      throw new Error("Next execution date cannot be before scheduler start date")
    }

    if (schedulerEndDate && schedulerStartDate.getTime() >= schedulerEndDate.getTime()) {
      throw new Error("Scheduler end date must be after start date")
    }

    if (frequencyMinutes <= 0) {
      throw new Error("Frequency must be greater than 0 minutes")
    }
  }

  isActive(): boolean {
    const now = new Date()
    if (now < this.schedulerStartDate) {
      return false
    }
    if (this.schedulerEndDate && now > this.schedulerEndDate) {
      return false
    }
    return true
  }

  shouldExecuteNow(): boolean {
    const now = new Date()
    return this.isActive() && now >= this.nextExecutionDate
  }

  withNextExecutionDate(date: Date): OracleConfig {
    return new OracleConfig(this.schedulerStartDate, this.schedulerEndDate, date, this.frequencyMinutes)
  }

  withUpdatedDates(startDate?: Date, endDate?: Date | null): OracleConfig {
    const newStartDate = startDate ?? this.schedulerStartDate
    const newEndDate = endDate !== undefined ? endDate : this.schedulerEndDate

    // Recalculate nextExecutionDate if it's before the new start date
    let newNextExecutionDate = this.nextExecutionDate
    if (newNextExecutionDate < newStartDate) {
      newNextExecutionDate = newStartDate
    }

    return new OracleConfig(newStartDate, newEndDate, newNextExecutionDate, this.frequencyMinutes)
  }

  withUpdatedFrequency(frequencyMinutes: number): OracleConfig {
    return new OracleConfig(this.schedulerStartDate, this.schedulerEndDate, this.nextExecutionDate, frequencyMinutes)
  }

  calculateNextExecutionDate(currentDate: Date): Date {
    return new Date(currentDate.getTime() + this.frequencyMinutes * 60 * 1000)
  }
}
