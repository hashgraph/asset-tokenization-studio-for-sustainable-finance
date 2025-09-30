import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateSchema1759133092414 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "EventFilter" (
          id uuid DEFAULT uuid_generate_v4() NOT NULL,
          "createdAt" timestamp DEFAULT now() NOT NULL,
          "updatedAt" timestamp DEFAULT now() NOT NULL,
          "contractAddress" varchar NOT NULL,
          "eventName" varchar NOT NULL,
          "eventSignature" varchar NOT NULL,
          CONSTRAINT "PK_EventFilter" PRIMARY KEY (id)
        )
      `)

    await queryRunner.query(`
        CREATE TABLE "EventStore" (
          id uuid DEFAULT uuid_generate_v4() NOT NULL,
          "createdAt" timestamp DEFAULT now() NOT NULL,
          "updatedAt" timestamp DEFAULT now() NOT NULL,
          status "EventStore_status_enum" NOT NULL,
          "eventName" varchar NOT NULL,
          "data" varchar NOT NULL,
          "errorReason" varchar NULL,
          CONSTRAINT "PK_EventStore" PRIMARY KEY (id)
        )
      `)

    await queryRunner.query(`
        CREATE TABLE "SyncState" (
          id uuid DEFAULT uuid_generate_v4() NOT NULL,
          "createdAt" timestamp DEFAULT now() NOT NULL,
          "updatedAt" timestamp DEFAULT now() NOT NULL,
          "lastBlockNumber" int4 NOT NULL,
          CONSTRAINT "PK_SyncState" PRIMARY KEY (id)
        )
      `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "SyncState"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "EventStore"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "EventFilter"`)
  }
}
