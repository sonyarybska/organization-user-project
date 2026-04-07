import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTrackingEventsAndChangeConstraintForCompanyProspect1775136305722 implements MigrationInterface {
    name = 'AddTrackingEventsAndChangeConstraintForCompanyProspect1775136305722'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Prospect" DROP CONSTRAINT "FK_8ba050c2978e992ca906b25d054"`);
        await queryRunner.query(`CREATE TABLE "TrackingEvent" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "eventType" character varying NOT NULL, "userEmail" character varying NOT NULL, "organizationId" uuid, "resourceType" character varying, "resourceId" uuid, "ipAddress" character varying, "userAgent" character varying, "source" character varying, "sourceName" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b86b539ef4612094f54b6a969d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Prospect" ADD CONSTRAINT "FK_8ba050c2978e992ca906b25d054" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "TrackingEvent" ADD CONSTRAINT "FK_d15e272d39e38a6a6753236978e" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "TrackingEvent" DROP CONSTRAINT "FK_d15e272d39e38a6a6753236978e"`);
        await queryRunner.query(`ALTER TABLE "Prospect" DROP CONSTRAINT "FK_8ba050c2978e992ca906b25d054"`);
        await queryRunner.query(`DROP TABLE "TrackingEvent"`);
        await queryRunner.query(`ALTER TABLE "Prospect" ADD CONSTRAINT "FK_8ba050c2978e992ca906b25d054" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
