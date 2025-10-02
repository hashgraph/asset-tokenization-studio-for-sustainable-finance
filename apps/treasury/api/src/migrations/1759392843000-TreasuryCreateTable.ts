import { MigrationInterface, QueryRunner } from "typeorm"

export class TreasuryCreateTable1759392843000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "Treasury" (
          id uuid DEFAULT uuid_generate_v4() NOT NULL,
          "contractAddress" varchar NOT NULL,
          "bondContractAddress" varchar NOT NULL,
          "balance" numeric NOT NULL,
          "createdAt" timestamp DEFAULT now() NOT NULL,
          "updatedAt" timestamp DEFAULT now() NOT NULL,
          CONSTRAINT "PK_Treasury" PRIMARY KEY (id)
        )
      `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "Treasury"`)
  }
}
