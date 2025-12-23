import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProspectsAndImportRecords1766489001310 implements MigrationInterface {
    name = 'AddProspectsAndImportRecords1766489001310';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE TABLE "Prospect" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "companyName" character varying, "domain" character varying, "phone" character varying, "salary" integer, "department" character varying, "linkedinUrl" character varying, "title" character varying, "userId" uuid NOT NULL, "organizationId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "source" character varying NOT NULL, CONSTRAINT "PK_023342dbbd2de7903e4ed5b500b" PRIMARY KEY ("id"))');
        await queryRunner.query('CREATE UNIQUE INDEX "IDX_5a266187ab46500702fedf9cb2" ON "Prospect" ("email", "organizationId") ');
        await queryRunner.query('CREATE TABLE "CsvImportRecord" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "organizationId" uuid NOT NULL, "userId" uuid NOT NULL, "status" character varying NOT NULL, "totalRows" integer, "processedRows" integer, "failedRows" integer, "lastError" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3f27b3053e359ef0ab307bcb7d7" PRIMARY KEY ("id"))');
         //rename table OrganizationInvitation
        await queryRunner.renameTable('OrganizationInvitation', 'OrganizationInvite');
        await queryRunner.query('ALTER TABLE "OrganizationInvite" ADD "token" character varying NOT NULL');
        await queryRunner.query('ALTER TABLE "User" DROP COLUMN "password"');
        await queryRunner.query('ALTER TABLE "User" ADD "cognitoUserId" character varying');
        await queryRunner.query('ALTER TABLE "User" ADD CONSTRAINT "UQ_3012b24eadecc4aaa23a7d2e234" UNIQUE ("cognitoUserId")');
        await queryRunner.query('ALTER TABLE "User" ALTER COLUMN "name" DROP NOT NULL');
        await queryRunner.query('ALTER TABLE "User" ALTER COLUMN "companyName" DROP NOT NULL');
        await queryRunner.query('ALTER TABLE "User" ALTER COLUMN "companyUrl" DROP NOT NULL');
        await queryRunner.query('ALTER TABLE "User" ALTER COLUMN "birthday" DROP NOT NULL');
        await queryRunner.query('ALTER TABLE "Prospect" ADD CONSTRAINT "FK_3b609e0edb984d331bdedc70998" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
        await queryRunner.query('ALTER TABLE "Prospect" ADD CONSTRAINT "FK_39e11469c8d41c3baa3cba3a147" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
        await queryRunner.query('ALTER TABLE "CsvImportRecord" ADD CONSTRAINT "FK_cf8821cb6aa8cc3c0ed02bd5068" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
        await queryRunner.query('ALTER TABLE "CsvImportRecord" ADD CONSTRAINT "FK_58d2641261f0e5950733d816900" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "CsvImportRecord" DROP CONSTRAINT "FK_58d2641261f0e5950733d816900"');
        await queryRunner.query('ALTER TABLE "CsvImportRecord" DROP CONSTRAINT "FK_cf8821cb6aa8cc3c0ed02bd5068"');
        await queryRunner.query('ALTER TABLE "Prospect" DROP CONSTRAINT "FK_39e11469c8d41c3baa3cba3a147"');
        await queryRunner.query('ALTER TABLE "Prospect" DROP CONSTRAINT "FK_3b609e0edb984d331bdedc70998"');
        await queryRunner.query('ALTER TABLE "User" ALTER COLUMN "birthday" SET NOT NULL');
        await queryRunner.query('ALTER TABLE "User" ALTER COLUMN "companyUrl" SET NOT NULL');
        await queryRunner.query('ALTER TABLE "User" ALTER COLUMN "companyName" SET NOT NULL');
        await queryRunner.query('ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL');
        await queryRunner.query('ALTER TABLE "User" DROP CONSTRAINT "UQ_3012b24eadecc4aaa23a7d2e234"');
        await queryRunner.query('ALTER TABLE "User" DROP COLUMN "cognitoUserId"');
        await queryRunner.query('ALTER TABLE "User" ADD "password" character varying');
        await queryRunner.query('ALTER TABLE "OrganizationInvite" DROP COLUMN "token"');
        await queryRunner.renameTable('OrganizationInvite', 'OrganizationInvitation');
        await queryRunner.query('DROP TABLE "CsvImportRecord"');
        await queryRunner.query('DROP INDEX "public"."IDX_5a266187ab46500702fedf9cb2"');
        await queryRunner.query('DROP TABLE "Prospect"');
    }

}
