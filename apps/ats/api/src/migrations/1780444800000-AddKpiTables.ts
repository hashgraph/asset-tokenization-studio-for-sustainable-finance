import { MigrationInterface, QueryRunner } from "typeorm"

export class AddKpiTables1780444800000 implements MigrationInterface {
  name = "AddKpiTables1780444800000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "BondInterestRates" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "bondContractId" character varying(255) NOT NULL,
                "operator" character varying(255) NOT NULL,
                "maxRate" character varying NOT NULL,
                "baseRate" character varying NOT NULL,
                "minRate" character varying NOT NULL,
                "startPeriod" character varying NOT NULL DEFAULT '0',
                "startRate" character varying NOT NULL,
                "missedPenalty" character varying NOT NULL,
                "reportPeriod" character varying NOT NULL,
                "rateDecimals" character varying NOT NULL,
                CONSTRAINT "UQ_37b2d0cdac55ff559bc1e4708fe" UNIQUE ("bondContractId"),
                CONSTRAINT "PK_ea111192ff0ea75ed7a7dc09d76" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "BondImpactData" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "bondContractId" character varying(255) NOT NULL,
                "operator" character varying(255) NOT NULL,
                "maxDeviationCap" character varying NOT NULL,
                "baseLine" character varying NOT NULL,
                "maxDeviationFloor" character varying NOT NULL,
                "impactDataDecimals" character varying NOT NULL,
                "adjustmentPrecision" character varying NOT NULL,
                CONSTRAINT "UQ_66b6850e3f33545592d11dfd87f" UNIQUE ("bondContractId"),
                CONSTRAINT "PK_a8e21b9943c7b26fba063b6b0ab" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "BondKpiData" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "bondContractId" character varying(255) NOT NULL,
                "project" character varying(255) NOT NULL,
                "date" character varying NOT NULL,
                "value" character varying NOT NULL,
                CONSTRAINT "PK_7c83223c3a7650b0f5159cee7de" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "BondKpiData_bond_date_project_idx" ON "BondKpiData" ("bondContractId", "date", "project")
        `)
    await queryRunner.query(`
            ALTER TABLE "BondCoupons"
            ALTER COLUMN "startDate" DROP DEFAULT
        `)
    await queryRunner.query(`
            ALTER TABLE "BondCoupons"
            ALTER COLUMN "endDate" DROP DEFAULT
        `)
    await queryRunner.query(`
            ALTER TABLE "BondCoupons"
            ALTER COLUMN "fixingDate" DROP DEFAULT
        `)
    await queryRunner.query(`
            ALTER TABLE "BondCoupons"
            ALTER COLUMN "rateStatus" DROP DEFAULT
        `)
    await queryRunner.query(`
            ALTER TABLE "BondInterestRates"
            ADD CONSTRAINT "FK_37b2d0cdac55ff559bc1e4708fe" FOREIGN KEY ("bondContractId") REFERENCES "Bonds"("contractId") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "BondImpactData"
            ADD CONSTRAINT "FK_66b6850e3f33545592d11dfd87f" FOREIGN KEY ("bondContractId") REFERENCES "Bonds"("contractId") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "BondKpiData"
            ADD CONSTRAINT "FK_5e92d85266d5a2747ecccf99d85" FOREIGN KEY ("bondContractId") REFERENCES "Bonds"("contractId") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "BondKpiData" DROP CONSTRAINT "FK_5e92d85266d5a2747ecccf99d85"
        `)
    await queryRunner.query(`
            ALTER TABLE "BondImpactData" DROP CONSTRAINT "FK_66b6850e3f33545592d11dfd87f"
        `)
    await queryRunner.query(`
            ALTER TABLE "BondInterestRates" DROP CONSTRAINT "FK_37b2d0cdac55ff559bc1e4708fe"
        `)
    await queryRunner.query(`
            ALTER TABLE "BondCoupons"
            ALTER COLUMN "rateStatus"
            SET DEFAULT '0'
        `)
    await queryRunner.query(`
            ALTER TABLE "BondCoupons"
            ALTER COLUMN "fixingDate"
            SET DEFAULT now()
        `)
    await queryRunner.query(`
            ALTER TABLE "BondCoupons"
            ALTER COLUMN "endDate"
            SET DEFAULT now()
        `)
    await queryRunner.query(`
            ALTER TABLE "BondCoupons"
            ALTER COLUMN "startDate"
            SET DEFAULT now()
        `)
    await queryRunner.query(`
            DROP INDEX "public"."BondKpiData_bond_date_project_idx"
        `)
    await queryRunner.query(`
            DROP TABLE "BondKpiData"
        `)
    await queryRunner.query(`
            DROP TABLE "BondImpactData"
        `)
    await queryRunner.query(`
            DROP TABLE "BondInterestRates"
        `)
  }
}
