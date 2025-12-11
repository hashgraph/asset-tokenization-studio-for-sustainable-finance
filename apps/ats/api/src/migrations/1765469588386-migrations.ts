import { MigrationInterface, QueryRunner } from "typeorm"

export class Migrations1765469588386 implements MigrationInterface {
  name = "Migrations1765469588386"

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
            CREATE TABLE "Bonds" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "contractId" character varying(255) NOT NULL,
                "treasuryId" character varying(255) NOT NULL,
                "kpiId" character varying(255) NOT NULL,
                "name" character varying(255) NOT NULL,
                "symbol" character varying(50) NOT NULL,
                "isin" character varying(50) NOT NULL,
                "decimals" integer NOT NULL,
                "currency" character varying(50) NOT NULL,
                "nominalValue" character varying NOT NULL,
                "nominalValueDecimals" integer NOT NULL,
                "startingDate" TIMESTAMP NOT NULL,
                "maturityDate" TIMESTAMP NOT NULL,
                "maxSupply" character varying NOT NULL,
                "isPaused" boolean NOT NULL DEFAULT false,
                CONSTRAINT "UQ_2cf6b624b397c0a8078f16fbddd" UNIQUE ("contractId"),
                CONSTRAINT "UQ_4c40880248a9a3a237b188965af" UNIQUE ("treasuryId"),
                CONSTRAINT "UQ_d88d104a943bbfaf4d2ab430b22" UNIQUE ("kpiId"),
                CONSTRAINT "PK_bd88da3d4e617b45daec32b53e5" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "BondDocuments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "name" character varying(255) NOT NULL,
                "bondContractId" character varying(255) NOT NULL,
                "uri" character varying(255) NOT NULL,
                "hash" character varying(255) NOT NULL,
                CONSTRAINT "PK_9ec1fa9f74b16b31b6b594911d4" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_33f120ceec1710f065ee819c5a" ON "BondDocuments" ("name", "bondContractId")
        `)
    await queryRunner.query(`
            CREATE TABLE "BondControlListMembers" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "bondContractId" character varying(255) NOT NULL,
                "holderAccountId" character varying(255) NOT NULL,
                CONSTRAINT "PK_765d1e32a7c5f05b128072c231f" PRIMARY KEY ("id", "bondContractId")
            )
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_69be11bd67d0c7cac7743a459b" ON "BondControlListMembers" ("bondContractId", "holderAccountId")
        `)
    await queryRunner.query(`
            CREATE TABLE "BondCoupons" (
                "id" character varying NOT NULL,
                "bondContractId" character varying(255) NOT NULL,
                "corporateActionId" character varying(255) NOT NULL,
                "operator" character varying(255) NOT NULL,
                "recordDate" TIMESTAMP NOT NULL,
                "executionDate" TIMESTAMP NOT NULL,
                "rate" character varying NOT NULL,
                "rateDecimals" character varying NOT NULL,
                "period" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_ef727bb8985680fe363513f5005" PRIMARY KEY ("id", "bondContractId")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "BondLocks" (
                "id" integer NOT NULL,
                "bondContractId" character varying NOT NULL,
                "holderAccountId" character varying(255) NOT NULL,
                "partition" character varying(255) NOT NULL,
                "amount" character varying NOT NULL,
                "expirationTimestamp" TIMESTAMP NOT NULL,
                "operatorAccountId" character varying(255) NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_cde54300f8fde233bf2496adf67" PRIMARY KEY ("id", "bondContractId")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "BondHolderBalances" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "bondContractId" character varying(255) NOT NULL,
                "holderAccountId" character varying(255) NOT NULL,
                "partition" character varying(255) NOT NULL,
                "availableBalance" character varying NOT NULL,
                "lockedBalance" character varying NOT NULL DEFAULT '0',
                "heldBalance" character varying NOT NULL DEFAULT '0',
                "clearingBalance" character varying NOT NULL DEFAULT '0',
                CONSTRAINT "PK_965d9efd9891db41840956fb132" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_bc456e98420d4f5e87e3925c00" ON "BondHolderBalances" ("bondContractId", "holderAccountId", "partition")
        `)
    await queryRunner.query(`
            CREATE TABLE "Factory" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "contractId" character varying NOT NULL,
                "isPaused" boolean NOT NULL DEFAULT false,
                CONSTRAINT "UQ_529d898f5e0a2e448aa9b743b1b" UNIQUE ("contractId"),
                CONSTRAINT "PK_6635a0ad5ed4a0499652a126970" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "BondProceedRecipients" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "bondContractId" character varying(255) NOT NULL,
                "proceedRecipientAddress" character varying(255) NOT NULL,
                "data" text,
                CONSTRAINT "PK_711b94a0ccecbdbb0227624ddd1" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_9380e10a9fd155834657f1dfdd" ON "BondProceedRecipients" ("bondContractId", "proceedRecipientAddress")
        `)
    await queryRunner.query(`
            CREATE TABLE "BondHolds" (
                "id" integer NOT NULL,
                "bondContractId" character varying NOT NULL,
                "holderAccountId" character varying(255) NOT NULL,
                "partition" character varying(255) NOT NULL,
                "amount" character varying NOT NULL,
                "expirationTimestamp" TIMESTAMP NOT NULL,
                "escrowAccountId" character varying(255) NOT NULL,
                "toAccountId" character varying(255) NOT NULL,
                "data" text,
                "operatorData" text,
                "operatorAccountId" character varying(255) NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_718f964b98b409d2196622e6a0e" PRIMARY KEY (
                    "id",
                    "bondContractId",
                    "holderAccountId",
                    "partition"
                )
            )
        `)
    await queryRunner.query(`
            CREATE TYPE "public"."BondClearingHolds_status_enum" AS ENUM('PENDING', 'APPROVED', 'CANCELED', 'RECLAIMED')
        `)
    await queryRunner.query(`
            CREATE TABLE "BondClearingHolds" (
                "id" integer NOT NULL,
                "bondContractId" character varying(255) NOT NULL,
                "holderAccountId" character varying(255) NOT NULL,
                "partition" character varying(255) NOT NULL,
                "amount" character varying(255) NOT NULL,
                "expirationDate" TIMESTAMP NOT NULL,
                "status" "public"."BondClearingHolds_status_enum" NOT NULL,
                "holdId" character varying(255),
                "toAccountId" character varying(255),
                "escrowAccountId" character varying(255) NOT NULL,
                "data" text,
                "operatorData" text,
                "operatorAccountId" character varying(255) NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_1de6e447d25540dd243dde18faf" PRIMARY KEY ("id", "bondContractId", "holderAccountId")
            )
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_edfff8ffa25a800d12080e299a" ON "BondClearingHolds" ("bondContractId", "holderAccountId")
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_1de6e447d25540dd243dde18fa" ON "BondClearingHolds" ("bondContractId", "holderAccountId", "id")
        `)
    await queryRunner.query(`
            CREATE TYPE "public"."BondClearingRedeems_status_enum" AS ENUM('PENDING', 'APPROVED', 'CANCELED', 'RECLAIMED')
        `)
    await queryRunner.query(`
            CREATE TABLE "BondClearingRedeems" (
                "id" integer NOT NULL,
                "bondContractId" character varying(255) NOT NULL,
                "holderAccountId" character varying(255) NOT NULL,
                "partition" character varying(255) NOT NULL,
                "amount" character varying(255) NOT NULL,
                "expirationDate" TIMESTAMP NOT NULL,
                "status" "public"."BondClearingRedeems_status_enum" NOT NULL,
                "data" text,
                "operatorData" text,
                "operatorAccountId" character varying(255) NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_894c8281b4864831b072e33acf5" PRIMARY KEY ("id", "bondContractId", "holderAccountId")
            )
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_db67a0c2aa01d436ef7d9bd501" ON "BondClearingRedeems" ("bondContractId", "holderAccountId")
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_894c8281b4864831b072e33acf" ON "BondClearingRedeems" ("bondContractId", "holderAccountId", "id")
        `)
    await queryRunner.query(`
            CREATE TYPE "public"."BondClearingTransfers_status_enum" AS ENUM('PENDING', 'APPROVED', 'CANCELED', 'RECLAIMED')
        `)
    await queryRunner.query(`
            CREATE TABLE "BondClearingTransfers" (
                "id" integer NOT NULL,
                "bondContractId" character varying(255) NOT NULL,
                "holderAccountId" character varying(255) NOT NULL,
                "partition" character varying(255) NOT NULL,
                "amount" character varying(255) NOT NULL,
                "expirationDate" TIMESTAMP NOT NULL,
                "status" "public"."BondClearingTransfers_status_enum" NOT NULL,
                "toAccountId" character varying(255) NOT NULL,
                "data" text,
                "operatorData" text,
                "operatorAccountId" character varying(255) NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_571a0596e33e1c21deb5a44c941" PRIMARY KEY ("id", "bondContractId", "holderAccountId")
            )
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_a3630c994afab517851e786591" ON "BondClearingTransfers" ("bondContractId", "holderAccountId")
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_571a0596e33e1c21deb5a44c94" ON "BondClearingTransfers" ("bondContractId", "holderAccountId", "id")
        `)
    await queryRunner.query(`
            ALTER TABLE "BondDocuments"
            ADD CONSTRAINT "FK_803fdbc95480b5f955d9914242f" FOREIGN KEY ("bondContractId") REFERENCES "Bonds"("contractId") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "BondControlListMembers"
            ADD CONSTRAINT "FK_d6f9c3fd8cbd33a1cc4d19ab1d4" FOREIGN KEY ("bondContractId") REFERENCES "Bonds"("contractId") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "BondCoupons"
            ADD CONSTRAINT "FK_db54d967c3243501a95fde77105" FOREIGN KEY ("bondContractId") REFERENCES "Bonds"("contractId") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "BondLocks"
            ADD CONSTRAINT "FK_14729ecb78808b251059b7ed110" FOREIGN KEY ("bondContractId") REFERENCES "Bonds"("contractId") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "BondHolderBalances"
            ADD CONSTRAINT "FK_3e291b1dcc077057799a60f505e" FOREIGN KEY ("bondContractId") REFERENCES "Bonds"("contractId") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "BondProceedRecipients"
            ADD CONSTRAINT "FK_ffe2e30364e6ddda12a22172666" FOREIGN KEY ("bondContractId") REFERENCES "Bonds"("contractId") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "BondHolds"
            ADD CONSTRAINT "FK_0460ab7feea07ceb0fe542bcc11" FOREIGN KEY ("bondContractId") REFERENCES "Bonds"("contractId") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "BondClearingHolds"
            ADD CONSTRAINT "FK_6a310d54f468096270d8973b9cf" FOREIGN KEY ("bondContractId") REFERENCES "Bonds"("contractId") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "BondClearingRedeems"
            ADD CONSTRAINT "FK_277e5f8b66b69210d7044e0f1ff" FOREIGN KEY ("bondContractId") REFERENCES "Bonds"("contractId") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "BondClearingTransfers"
            ADD CONSTRAINT "FK_0d26deab44dd52936496d2bcbcb" FOREIGN KEY ("bondContractId") REFERENCES "Bonds"("contractId") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "BondClearingTransfers" DROP CONSTRAINT "FK_0d26deab44dd52936496d2bcbcb"
        `)
    await queryRunner.query(`
            ALTER TABLE "BondClearingRedeems" DROP CONSTRAINT "FK_277e5f8b66b69210d7044e0f1ff"
        `)
    await queryRunner.query(`
            ALTER TABLE "BondClearingHolds" DROP CONSTRAINT "FK_6a310d54f468096270d8973b9cf"
        `)
    await queryRunner.query(`
            ALTER TABLE "BondHolds" DROP CONSTRAINT "FK_0460ab7feea07ceb0fe542bcc11"
        `)
    await queryRunner.query(`
            ALTER TABLE "BondProceedRecipients" DROP CONSTRAINT "FK_ffe2e30364e6ddda12a22172666"
        `)
    await queryRunner.query(`
            ALTER TABLE "BondHolderBalances" DROP CONSTRAINT "FK_3e291b1dcc077057799a60f505e"
        `)
    await queryRunner.query(`
            ALTER TABLE "BondLocks" DROP CONSTRAINT "FK_14729ecb78808b251059b7ed110"
        `)
    await queryRunner.query(`
            ALTER TABLE "BondCoupons" DROP CONSTRAINT "FK_db54d967c3243501a95fde77105"
        `)
    await queryRunner.query(`
            ALTER TABLE "BondControlListMembers" DROP CONSTRAINT "FK_d6f9c3fd8cbd33a1cc4d19ab1d4"
        `)
    await queryRunner.query(`
            ALTER TABLE "BondDocuments" DROP CONSTRAINT "FK_803fdbc95480b5f955d9914242f"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_571a0596e33e1c21deb5a44c94"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_a3630c994afab517851e786591"
        `)
    await queryRunner.query(`
            DROP TABLE "BondClearingTransfers"
        `)
    await queryRunner.query(`
            DROP TYPE "public"."BondClearingTransfers_status_enum"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_894c8281b4864831b072e33acf"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_db67a0c2aa01d436ef7d9bd501"
        `)
    await queryRunner.query(`
            DROP TABLE "BondClearingRedeems"
        `)
    await queryRunner.query(`
            DROP TYPE "public"."BondClearingRedeems_status_enum"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_1de6e447d25540dd243dde18fa"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_edfff8ffa25a800d12080e299a"
        `)
    await queryRunner.query(`
            DROP TABLE "BondClearingHolds"
        `)
    await queryRunner.query(`
            DROP TYPE "public"."BondClearingHolds_status_enum"
        `)
    await queryRunner.query(`
            DROP TABLE "BondHolds"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_9380e10a9fd155834657f1dfdd"
        `)
    await queryRunner.query(`
            DROP TABLE "BondProceedRecipients"
        `)
    await queryRunner.query(`
            DROP TABLE "Factory"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_bc456e98420d4f5e87e3925c00"
        `)
    await queryRunner.query(`
            DROP TABLE "BondHolderBalances"
        `)
    await queryRunner.query(`
            DROP TABLE "BondLocks"
        `)
    await queryRunner.query(`
            DROP TABLE "BondCoupons"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_69be11bd67d0c7cac7743a459b"
        `)
    await queryRunner.query(`
            DROP TABLE "BondControlListMembers"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_33f120ceec1710f065ee819c5a"
        `)
    await queryRunner.query(`
            DROP TABLE "BondDocuments"
        `)
    await queryRunner.query(`
            DROP TABLE "Bonds"
        `)
    await queryRunner.query(`
            DROP TABLE "UserRole"
        `)
  }
}
