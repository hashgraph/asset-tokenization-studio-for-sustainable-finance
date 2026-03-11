import { MigrationInterface, QueryRunner } from "typeorm"

export class UpdateBondCoupons1771573154000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new date columns for coupon periods
    await queryRunner.query(`ALTER TABLE "BondCoupons" ADD COLUMN "startDate" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`ALTER TABLE "BondCoupons" ADD COLUMN "endDate" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`ALTER TABLE "BondCoupons" ADD COLUMN "fixingDate" TIMESTAMP NOT NULL DEFAULT now()`)

    // Add rateStatus column (0 = PENDING, 1 = FIXED)
    await queryRunner.query(`ALTER TABLE "BondCoupons" ADD COLUMN "rateStatus" character varying NOT NULL DEFAULT '0'`)

    // Drop obsolete period column
    await queryRunner.query(`ALTER TABLE "BondCoupons" DROP COLUMN "period"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore period column
    await queryRunner.query(`ALTER TABLE "BondCoupons" ADD COLUMN "period" character varying NOT NULL DEFAULT ''`)

    // Remove new columns in reverse order
    await queryRunner.query(`ALTER TABLE "BondCoupons" DROP COLUMN "rateStatus"`)
    await queryRunner.query(`ALTER TABLE "BondCoupons" DROP COLUMN "fixingDate"`)
    await queryRunner.query(`ALTER TABLE "BondCoupons" DROP COLUMN "endDate"`)
    await queryRunner.query(`ALTER TABLE "BondCoupons" DROP COLUMN "startDate"`)
  }
}
