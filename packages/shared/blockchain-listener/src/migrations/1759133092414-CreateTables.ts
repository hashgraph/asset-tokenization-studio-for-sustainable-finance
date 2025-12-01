import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateTables1759133092414 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "EventFilter" (
          id uuid DEFAULT uuid_generate_v4() NOT NULL,
          "createdAt" timestamp DEFAULT now() NOT NULL,
          "updatedAt" timestamp DEFAULT now() NOT NULL,
          "deletedAt" TIMESTAMP,
          "contractAddress" varchar NOT NULL,
          "eventName" varchar NOT NULL,
          "eventSignature" varchar NOT NULL,
          CONSTRAINT "PK_EventFilter" PRIMARY KEY (id)
        )
      `)

    await queryRunner.query(`
            CREATE TYPE "EventStore_status_enum" AS ENUM ('FAILED', 'PROCESSED')
        `)

    await queryRunner.query(`
        CREATE TABLE "EventStore" (
          id uuid DEFAULT uuid_generate_v4() NOT NULL,
          "createdAt" timestamp DEFAULT now() NOT NULL,
          "updatedAt" timestamp DEFAULT now() NOT NULL,
          "deletedAt" TIMESTAMP,
          status "EventStore_status_enum" NOT NULL,
          "eventName" varchar NOT NULL,
          "data" varchar NOT NULL,
          "errorReason" varchar NULL,
          CONSTRAINT "PK_EventStore" PRIMARY KEY (id)
        )
      `)

    await queryRunner.query(`
            CREATE TYPE "SyncState_status_enum" AS ENUM ('OK', 'FAILED')
        `)

    await queryRunner.query(`
        CREATE TABLE "SyncState" (
          id uuid DEFAULT uuid_generate_v4() NOT NULL,
          "createdAt" timestamp DEFAULT now() NOT NULL,
          "updatedAt" timestamp DEFAULT now() NOT NULL,
          "deletedAt" TIMESTAMP,
          "lastBlockNumber" int4 NULL,
          status "SyncState_status_enum" NOT NULL,
          CONSTRAINT "PK_SyncState" PRIMARY KEY (id)
        )
      `)

    await queryRunner.query(`
      INSERT INTO "SyncState" (id, "createdAt", "lastBlockNumber", "status") VALUES('8447d05c-ffee-4a71-ae1b-23131f72879b'::uuid, now(), NULL, 'OK')
      `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "SyncState"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "EventStore"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "EventFilter"`)
  }
}
