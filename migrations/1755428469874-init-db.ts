import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDb1755428469874 implements MigrationInterface {
    name = 'InitDb1755428469874'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Organization" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fdea86baf6906a6792f2b60d6ff" UNIQUE ("name"), CONSTRAINT "PK_67bcafc78935cd441a054c6d4ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."UserOrganization_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`CREATE TABLE "UserOrganization" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "organizationId" uuid NOT NULL, "role" "public"."UserOrganization_role_enum" NOT NULL DEFAULT 'user', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f0ca387466f3997fbf226488b37" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "userOrganizationUserIdPerOrganizationId" ON "UserOrganization" ("userId", "organizationId") `);
        await queryRunner.query(`CREATE TABLE "Attachment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "originalName" character varying NOT NULL, "key" character varying NOT NULL, "publicKey" character varying NOT NULL, "userId" character varying NOT NULL, "fileSizeInBytes" integer NOT NULL, CONSTRAINT "PK_b5708fe507c278546d69ee56566" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "User" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "companyName" character varying NOT NULL, "companyUrl" character varying NOT NULL, "birthday" TIMESTAMP NOT NULL, "isConfirm" boolean NOT NULL DEFAULT false, "avatarId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4a257d2c9837248d70640b3e36e" UNIQUE ("email"), CONSTRAINT "REL_ecd9b3ed5dd5d888d739063806" UNIQUE ("avatarId"), CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."OrganizationInvitation_status_enum" AS ENUM('pending', 'accepted', 'declined')`);
        await queryRunner.query(`CREATE TABLE "OrganizationInvitation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "organizationId" uuid NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "status" "public"."OrganizationInvitation_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_22ed4a53b5f36f3839d0a270ae8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "UserOrganization" ADD CONSTRAINT "FK_cce3657343611eaed1de026e0d0" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "UserOrganization" ADD CONSTRAINT "FK_597abe2d9ca8cf0cf0322bc9eca" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "User" ADD CONSTRAINT "FK_ecd9b3ed5dd5d888d739063806b" FOREIGN KEY ("avatarId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "OrganizationInvitation" ADD CONSTRAINT "FK_19a022bdd361c19acecf2500c00" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "OrganizationInvitation" DROP CONSTRAINT "FK_19a022bdd361c19acecf2500c00"`);
        await queryRunner.query(`ALTER TABLE "User" DROP CONSTRAINT "FK_ecd9b3ed5dd5d888d739063806b"`);
        await queryRunner.query(`ALTER TABLE "UserOrganization" DROP CONSTRAINT "FK_597abe2d9ca8cf0cf0322bc9eca"`);
        await queryRunner.query(`ALTER TABLE "UserOrganization" DROP CONSTRAINT "FK_cce3657343611eaed1de026e0d0"`);
        await queryRunner.query(`DROP TABLE "OrganizationInvitation"`);
        await queryRunner.query(`DROP TYPE "public"."OrganizationInvitation_status_enum"`);
        await queryRunner.query(`DROP TABLE "User"`);
        await queryRunner.query(`DROP TABLE "Attachment"`);
        await queryRunner.query(`DROP INDEX "public"."userOrganizationUserIdPerOrganizationId"`);
        await queryRunner.query(`DROP TABLE "UserOrganization"`);
        await queryRunner.query(`DROP TYPE "public"."UserOrganization_role_enum"`);
        await queryRunner.query(`DROP TABLE "Organization"`);
    }

}
