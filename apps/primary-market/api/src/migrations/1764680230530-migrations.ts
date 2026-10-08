import { MigrationInterface, QueryRunner } from "typeorm"

export class Migrations1764680230530 implements MigrationInterface {
  name = "Migrations1764680230530"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "UserRole" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "userAccountId" character varying NOT NULL,
                "roleId" character varying NOT NULL,
                "contractId" character varying NOT NULL,
                CONSTRAINT "PK_83fd6b024a41173978f5b2b9b79" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "Offering" (
                "id" integer NOT NULL,
                "marketId" uuid NOT NULL,
                "bondContractId" character varying NOT NULL,
                "operatorAccountId" character varying NOT NULL,
                "treasuryContractId" character varying NOT NULL,
                "paymentTokenContractId" character varying NOT NULL,
                "lotSize" character varying NOT NULL,
                "minLots" character varying NOT NULL,
                "maxLots" character varying NOT NULL,
                "targetLots" character varying NOT NULL,
                "targetQuantityRule" integer NOT NULL,
                "startDate" TIMESTAMP NOT NULL,
                "endDate" TIMESTAMP NOT NULL,
                "deadlineRule" integer NOT NULL,
                "price" character varying NOT NULL,
                "priceDecimals" integer NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_ca45da998740cbc4e7234f3275a" PRIMARY KEY ("id", "marketId")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "PrimaryMarket" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "contractId" character varying NOT NULL,
                "isPaused" boolean NOT NULL DEFAULT false,
                CONSTRAINT "UQ_cbc4c75b536429efa8fa45c75b4" UNIQUE ("contractId"),
                CONSTRAINT "PK_95afbd8efadc04499d0c09f76b1" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TYPE "public"."Subscription_status_enum" AS ENUM('SUBMITTED', 'EXECUTED', 'FAILED', 'CANCELLED')
        `)
    await queryRunner.query(`
            CREATE TABLE "Subscription" (
                "id" integer NOT NULL,
                "offeringId" integer NOT NULL,
                "marketId" uuid NOT NULL,
                "investorAccountId" character varying NOT NULL,
                "lotUnits" character varying NOT NULL,
                "status" "public"."Subscription_status_enum" NOT NULL DEFAULT 'SUBMITTED',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_bd5f9fdce5795c6959688375f12" PRIMARY KEY ("id", "offeringId", "marketId")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "PrimaryMarketFactory" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "contractId" character varying NOT NULL,
                "isPaused" boolean NOT NULL DEFAULT false,
                CONSTRAINT "UQ_cd10eb7127035001441fb038033" UNIQUE ("contractId"),
                CONSTRAINT "PK_3acd9115f84dbe25cae569afd1f" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            ALTER TABLE "Offering"
            ADD CONSTRAINT "FK_53f3a76cccc98f65922e5a23843" FOREIGN KEY ("marketId") REFERENCES "PrimaryMarket"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "Subscription"
            ADD CONSTRAINT "FK_acd48d42e28fbe02d06e16b1c47" FOREIGN KEY ("offeringId", "marketId") REFERENCES "Offering"("id", "marketId") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "Subscription" DROP CONSTRAINT "FK_acd48d42e28fbe02d06e16b1c47"
        `)
    await queryRunner.query(`
            ALTER TABLE "Offering" DROP CONSTRAINT "FK_53f3a76cccc98f65922e5a23843"
        `)
    await queryRunner.query(`
            DROP TABLE "PrimaryMarketFactory"
        `)
    await queryRunner.query(`
            DROP TABLE "Subscription"
        `)
    await queryRunner.query(`
            DROP TYPE "public"."Subscription_status_enum"
        `)
    await queryRunner.query(`
            DROP TABLE "PrimaryMarket"
        `)
    await queryRunner.query(`
            DROP TABLE "Offering"
        `)
    await queryRunner.query(`
            DROP TABLE "UserRole"
        `)
  }
}
