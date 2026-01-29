import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompanyTable1770215481710 implements MigrationInterface {
    name = 'AddCompanyTable1770215481710'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "CsvImportRecord" DROP CONSTRAINT "FK_58d2641261f0e5950733d816900"`);
        await queryRunner.query(`CREATE TABLE "Company" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "domain" character varying NOT NULL, "source" character varying NOT NULL, "organizationId" uuid NOT NULL, "linkedinUrl" character varying, "name" character varying, "address" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b4993a6b3d3194767a59698298f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_26d3e09ccafc3ce8f5db6f879f" ON "Company" ("domain", "organizationId") `);
        await queryRunner.query(`ALTER TABLE "Prospect" DROP COLUMN "companyName"`);
        await queryRunner.query(`ALTER TABLE "Prospect" ADD "companyId" uuid`);
        await queryRunner.query(`ALTER TABLE "Prospect" ADD "source" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "CsvImportRecord" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."CsvImportRecord_status_enum"`);
        await queryRunner.query(`ALTER TABLE "CsvImportRecord" ADD "status" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Company" ADD CONSTRAINT "FK_c67133d954d8fba046931e66110" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Prospect" ADD CONSTRAINT "FK_8ba050c2978e992ca906b25d054" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "CsvImportRecord" ADD CONSTRAINT "FK_58d2641261f0e5950733d816900" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "CsvImportRecord" DROP CONSTRAINT "FK_58d2641261f0e5950733d816900"`);
        await queryRunner.query(`ALTER TABLE "Prospect" DROP CONSTRAINT "FK_8ba050c2978e992ca906b25d054"`);
        await queryRunner.query(`ALTER TABLE "Company" DROP CONSTRAINT "FK_c67133d954d8fba046931e66110"`);
        await queryRunner.query(`ALTER TABLE "CsvImportRecord" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."CsvImportRecord_status_enum" AS ENUM('new', 'busy', 'done', 'error')`);
        await queryRunner.query(`ALTER TABLE "CsvImportRecord" ADD "status" "public"."CsvImportRecord_status_enum" NOT NULL DEFAULT 'new'`);
        await queryRunner.query(`ALTER TABLE "Prospect" DROP COLUMN "source"`);
        await queryRunner.query(`ALTER TABLE "Prospect" DROP COLUMN "companyId"`);
        await queryRunner.query(`ALTER TABLE "Prospect" ADD "companyName" character varying`);
        await queryRunner.query(`DROP INDEX "public"."IDX_26d3e09ccafc3ce8f5db6f879f"`);
        await queryRunner.query(`DROP TABLE "Company"`);
        await queryRunner.query(`ALTER TABLE "CsvImportRecord" ADD CONSTRAINT "FK_58d2641261f0e5950733d816900" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
