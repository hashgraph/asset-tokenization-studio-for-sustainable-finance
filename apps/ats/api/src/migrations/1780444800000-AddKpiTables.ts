import { MigrationInterface, QueryRunner } from "typeorm"

export class AddKpiTables1780444800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "BondInterestRates" (
        "id"             uuid         NOT NULL DEFAULT gen_random_uuid(),
        "bondContractId" varchar(255) NOT NULL,
        "operator"       varchar(255) NOT NULL,
        "maxRate"        varchar      NOT NULL,
        "baseRate"       varchar      NOT NULL,
        "minRate"        varchar      NOT NULL,
        "startPeriod"    varchar      NOT NULL DEFAULT '0',
        "startRate"      varchar      NOT NULL,
        "missedPenalty"  varchar      NOT NULL,
        "reportPeriod"   varchar      NOT NULL,
        "rateDecimals"   varchar      NOT NULL,
        "createdAt"      TIMESTAMP    NOT NULL DEFAULT now(),
        "updatedAt"      TIMESTAMP    NOT NULL DEFAULT now(),
        CONSTRAINT "PK_BondInterestRates" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_BondInterestRates_bondContractId" UNIQUE ("bondContractId")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "BondImpactData" (
        "id"                  uuid         NOT NULL DEFAULT gen_random_uuid(),
        "bondContractId"      varchar(255) NOT NULL,
        "operator"            varchar(255) NOT NULL,
        "maxDeviationCap"     varchar      NOT NULL,
        "baseLine"            varchar      NOT NULL,
        "maxDeviationFloor"   varchar      NOT NULL,
        "impactDataDecimals"  varchar      NOT NULL,
        "adjustmentPrecision" varchar      NOT NULL,
        "createdAt"           TIMESTAMP    NOT NULL DEFAULT now(),
        "updatedAt"           TIMESTAMP    NOT NULL DEFAULT now(),
        CONSTRAINT "PK_BondImpactData" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_BondImpactData_bondContractId" UNIQUE ("bondContractId")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "BondKpiData" (
        "id"             uuid         NOT NULL DEFAULT gen_random_uuid(),
        "bondContractId" varchar(255) NOT NULL,
        "project"        varchar(255) NOT NULL,
        "date"           varchar      NOT NULL,
        "value"          varchar      NOT NULL,
        "createdAt"      TIMESTAMP    NOT NULL DEFAULT now(),
        CONSTRAINT "PK_BondKpiData" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`
      CREATE UNIQUE INDEX "BondKpiData_bond_date_project_idx"
        ON "BondKpiData" ("bondContractId", "date", "project")
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "BondKpiData_bond_date_project_idx"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "BondKpiData"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "BondImpactData"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "BondInterestRates"`)
  }
}
