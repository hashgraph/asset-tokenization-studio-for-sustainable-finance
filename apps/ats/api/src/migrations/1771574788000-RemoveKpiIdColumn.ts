import { MigrationInterface, QueryRunner } from "typeorm"

export class RemoveKpiIdColumn1771574788000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop unique constraint first
    await queryRunner.query(`ALTER TABLE "Bonds" DROP CONSTRAINT IF EXISTS "UQ_d88d104a943bbfaf4d2ab430b22"`)
    // Drop column
    await queryRunner.query(`ALTER TABLE "Bonds" DROP COLUMN "kpiId"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: re-add column and constraint
    await queryRunner.query(`ALTER TABLE "Bonds" ADD COLUMN "kpiId" character varying(255) NOT NULL DEFAULT '0.0.0'`)
    await queryRunner.query(`ALTER TABLE "Bonds" ADD CONSTRAINT "UQ_d88d104a943bbfaf4d2ab430b22" UNIQUE ("kpiId")`)
    // Note: After rollback, kpiId values will be '0.0.0' - manual data fix may be needed
  }
}
