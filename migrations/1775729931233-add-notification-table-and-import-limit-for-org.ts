import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotificationTableAndImportLimitForOrg1775729931233 implements MigrationInterface {
    name = 'AddNotificationTableAndImportLimitForOrg1775729931233'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "organizationId" uuid, "type" character varying NOT NULL, "title" character varying NOT NULL, "message" text NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "readAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_da18f6446b6fea585f01d03f56c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3f49840daa52285c1fea1416a3" ON "Notification" ("userId", "organizationId", "isRead", "createdAt") `);
        await queryRunner.query(`ALTER TABLE "Organization" ADD "monthlyImportLimit" integer NOT NULL DEFAULT '1000'`);
        await queryRunner.query(`ALTER TABLE "Organization" ADD CONSTRAINT "OrganizationMonthlyImportLimitPositive" CHECK ("monthlyImportLimit" >= 0)`);
        await queryRunner.query(`ALTER TABLE "Notification" ADD CONSTRAINT "FK_39f36b790a14ce0cb846346db95" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Notification" ADD CONSTRAINT "FK_30d789a0dd9a048758cbbd00cdf" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Notification" DROP CONSTRAINT "FK_30d789a0dd9a048758cbbd00cdf"`);
        await queryRunner.query(`ALTER TABLE "Notification" DROP CONSTRAINT "FK_39f36b790a14ce0cb846346db95"`);
        await queryRunner.query(`ALTER TABLE "Organization" DROP CONSTRAINT "OrganizationMonthlyImportLimitPositive"`);
        await queryRunner.query(`ALTER TABLE "Organization" DROP COLUMN "monthlyImportLimit"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3f49840daa52285c1fea1416a3"`);
        await queryRunner.query(`DROP TABLE "Notification"`);
    }

}
