import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateTables1763459181562 implements MigrationInterface {
  name = "CreateTables1763459181562"

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
            CREATE TABLE "PaymentToken" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "contractId" character varying NOT NULL,
                "treasuryId" uuid NOT NULL,
                "decimals" integer NOT NULL,
                "removalDate" TIMESTAMP,
                "dissociationError" integer,
                CONSTRAINT "PK_a54efb37618bc4adf3c7e29d06b" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "Treasury" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "contractId" character varying NOT NULL,
                "bondContractId" character varying NOT NULL,
                "paused" boolean NOT NULL,
                "paymentTokenId" uuid,
                CONSTRAINT "REL_b681a3079e22124d18ec4724eb" UNIQUE ("paymentTokenId"),
                CONSTRAINT "PK_25993cc877ba889d258d6359589" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "EventStore" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "status" "public"."EventStore_status_enum" NOT NULL,
                "eventName" character varying NOT NULL,
                "data" character varying NOT NULL,
                "errorReason" character varying,
                CONSTRAINT "PK_7d0597360826c0cc7e590282359" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "SyncState" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "lastBlockNumber" integer NOT NULL,
                CONSTRAINT "PK_cb20b83abf4b4758b9157ddb768" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "EventFilter" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "contractAddress" character varying NOT NULL,
                "eventName" character varying NOT NULL,
                "eventSignature" character varying NOT NULL,
                CONSTRAINT "PK_af11c2e04446e53c3d48b1a99f8" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "EnvironmentalAsset" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "contractId" character varying NOT NULL,
                "treasuryId" uuid NOT NULL,
                "removalDate" TIMESTAMP,
                "dissociationError" integer,
                CONSTRAINT "PK_619f57e31f3afa2ec19fdc36ef9" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "EnvironmentalAssetToken" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "environmentalAssetId" uuid NOT NULL,
                "tokenId" integer NOT NULL,
                "removalDate" TIMESTAMP,
                CONSTRAINT "UQ_7d6a05549bffe907f7e12e432a8" UNIQUE ("environmentalAssetId", "tokenId"),
                CONSTRAINT "PK_986873ff353715ee7f42f303502" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "EnvironmentalAssetTransfer" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "accountId" character varying NOT NULL,
                "environmentalAssetId" uuid NOT NULL,
                "tokenId" integer NOT NULL,
                "type" character varying NOT NULL,
                CONSTRAINT "PK_1805fc26529d499004beeb66480" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "PaymentTokenTransfer" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "accountId" character varying NOT NULL,
                "amount" character varying NOT NULL,
                "paymentTokenId" uuid NOT NULL,
                "type" character varying NOT NULL,
                CONSTRAINT "PK_e2076ae7111c6948a99502c0607" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "ProceedsRecipient" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "contractId" character varying NOT NULL,
                "treasuryId" uuid NOT NULL,
                CONSTRAINT "PK_befe0a10fd97f4015cd70b33b1b" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "ProceedsRecipientAllocation" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "proceedsRecipientId" uuid NOT NULL,
                "paymentTokenId" uuid NOT NULL,
                "amount" character varying NOT NULL,
                CONSTRAINT "PK_44a2480efebe735a8462a5d1bd2" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "Distribution" (
                "id" integer NOT NULL,
                "treasuryId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_27f79549543dde2288ae0c2c89a" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "DistributionHolder" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "holderAccountId" character varying NOT NULL,
                "status" character varying NOT NULL,
                "amount" character varying,
                "distributionId" integer NOT NULL,
                "paymentTokenId" character varying NOT NULL,
                CONSTRAINT "PK_1dfb845ce679c3b5b6d12313f49" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "RedemptionHolder" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "holderAccountId" character varying NOT NULL,
                "status" character varying NOT NULL,
                "amount" character varying,
                "treasuryId" uuid NOT NULL,
                "paymentTokenId" uuid NOT NULL,
                CONSTRAINT "PK_3d696bcdfd6f124b18732b9392c" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            ALTER TABLE "PaymentToken"
            ADD CONSTRAINT "FK_5a0cdc06d7f6ab42fa57a1980a7" FOREIGN KEY ("treasuryId") REFERENCES "Treasury"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "Treasury"
            ADD CONSTRAINT "FK_b681a3079e22124d18ec4724eb3" FOREIGN KEY ("paymentTokenId") REFERENCES "PaymentToken"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "EnvironmentalAsset"
            ADD CONSTRAINT "FK_4539bbe4bd032eb752bcf5479ae" FOREIGN KEY ("treasuryId") REFERENCES "Treasury"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "EnvironmentalAssetToken"
            ADD CONSTRAINT "FK_0275edffe8d4be9f0569ae2a0b2" FOREIGN KEY ("environmentalAssetId") REFERENCES "EnvironmentalAsset"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "EnvironmentalAssetTransfer"
            ADD CONSTRAINT "FK_5109251c2f2aad7895b4531575c" FOREIGN KEY ("environmentalAssetId") REFERENCES "EnvironmentalAsset"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "PaymentTokenTransfer"
            ADD CONSTRAINT "FK_b4675fcde5d9eeb970edc18dd0c" FOREIGN KEY ("paymentTokenId") REFERENCES "PaymentToken"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "ProceedsRecipient"
            ADD CONSTRAINT "FK_3b85d7f5878e9939aeb7fe5fd41" FOREIGN KEY ("treasuryId") REFERENCES "Treasury"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "ProceedsRecipientAllocation"
            ADD CONSTRAINT "FK_310c35933ce788f4258e32897b4" FOREIGN KEY ("proceedsRecipientId") REFERENCES "ProceedsRecipient"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "ProceedsRecipientAllocation"
            ADD CONSTRAINT "FK_711ad39e082ddbeab2713c575b8" FOREIGN KEY ("paymentTokenId") REFERENCES "PaymentToken"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "Distribution"
            ADD CONSTRAINT "FK_854fbaf88413edecf508a5fe953" FOREIGN KEY ("treasuryId") REFERENCES "Treasury"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "DistributionHolder"
            ADD CONSTRAINT "FK_6a3bb32c48ae0da38ab1e346ce0" FOREIGN KEY ("distributionId") REFERENCES "Distribution"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "RedemptionHolder"
            ADD CONSTRAINT "FK_5d8e3d7ca52739e52ff234d1e0d" FOREIGN KEY ("treasuryId") REFERENCES "Treasury"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "RedemptionHolder"
            ADD CONSTRAINT "FK_cba7cd16eddfe608eb401599980" FOREIGN KEY ("paymentTokenId") REFERENCES "PaymentToken"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "RedemptionHolder" DROP CONSTRAINT "FK_cba7cd16eddfe608eb401599980"
        `)
    await queryRunner.query(`
            ALTER TABLE "RedemptionHolder" DROP CONSTRAINT "FK_5d8e3d7ca52739e52ff234d1e0d"
        `)
    await queryRunner.query(`
            ALTER TABLE "DistributionHolder" DROP CONSTRAINT "FK_6a3bb32c48ae0da38ab1e346ce0"
        `)
    await queryRunner.query(`
            ALTER TABLE "Distribution" DROP CONSTRAINT "FK_854fbaf88413edecf508a5fe953"
        `)
    await queryRunner.query(`
            ALTER TABLE "ProceedsRecipientAllocation" DROP CONSTRAINT "FK_711ad39e082ddbeab2713c575b8"
        `)
    await queryRunner.query(`
            ALTER TABLE "ProceedsRecipientAllocation" DROP CONSTRAINT "FK_310c35933ce788f4258e32897b4"
        `)
    await queryRunner.query(`
            ALTER TABLE "ProceedsRecipient" DROP CONSTRAINT "FK_3b85d7f5878e9939aeb7fe5fd41"
        `)
    await queryRunner.query(`
            ALTER TABLE "PaymentTokenTransfer" DROP CONSTRAINT "FK_b4675fcde5d9eeb970edc18dd0c"
        `)
    await queryRunner.query(`
            ALTER TABLE "EnvironmentalAssetTransfer" DROP CONSTRAINT "FK_5109251c2f2aad7895b4531575c"
        `)
    await queryRunner.query(`
            ALTER TABLE "EnvironmentalAssetToken" DROP CONSTRAINT "FK_0275edffe8d4be9f0569ae2a0b2"
        `)
    await queryRunner.query(`
            ALTER TABLE "EnvironmentalAsset" DROP CONSTRAINT "FK_4539bbe4bd032eb752bcf5479ae"
        `)
    await queryRunner.query(`
            ALTER TABLE "Treasury" DROP CONSTRAINT "FK_b681a3079e22124d18ec4724eb3"
        `)
    await queryRunner.query(`
            ALTER TABLE "PaymentToken" DROP CONSTRAINT "FK_5a0cdc06d7f6ab42fa57a1980a7"
        `)
    await queryRunner.query(`
            DROP TABLE "RedemptionHolder"
        `)
    await queryRunner.query(`
            DROP TABLE "DistributionHolder"
        `)
    await queryRunner.query(`
            DROP TABLE "Distribution"
        `)
    await queryRunner.query(`
            DROP TABLE "ProceedsRecipientAllocation"
        `)
    await queryRunner.query(`
            DROP TABLE "ProceedsRecipient"
        `)
    await queryRunner.query(`
            DROP TABLE "PaymentTokenTransfer"
        `)
    await queryRunner.query(`
            DROP TABLE "EnvironmentalAssetTransfer"
        `)
    await queryRunner.query(`
            DROP TABLE "EnvironmentalAssetToken"
        `)
    await queryRunner.query(`
            DROP TABLE "EnvironmentalAsset"
        `)
    await queryRunner.query(`
            DROP TABLE "EventFilter"
        `)
    await queryRunner.query(`
            DROP TABLE "SyncState"
        `)
    await queryRunner.query(`
            DROP TABLE "EventStore"
        `)
    await queryRunner.query(`
            DROP TABLE "Treasury"
        `)
    await queryRunner.query(`
            DROP TABLE "PaymentToken"
        `)
    await queryRunner.query(`
            DROP TABLE "UserRole"
        `)
  }
}
