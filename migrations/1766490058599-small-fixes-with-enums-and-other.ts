import { MigrationInterface, QueryRunner } from 'typeorm';

export class SmallFixesWithEnumsAndOther1766490058599 implements MigrationInterface {
  name = 'SmallFixesWithEnumsAndOther1766490058599';

  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(
      'ALTER TABLE "Attachment" DROP COLUMN "fileSizeInBytes"'
    );

    await queryRunner.query(
      'ALTER TABLE "OrganizationInvite" ALTER COLUMN "status" DROP DEFAULT'
    );

    await queryRunner.query(
      'ALTER TABLE "OrganizationInvite" ADD CONSTRAINT "UQ_6019d8b306f388c1e612f206e32" UNIQUE ("token")'
    );

    await queryRunner.query(
      'ALTER TABLE "UserOrganization" ALTER COLUMN "role" DROP DEFAULT'
    );

    await queryRunner.query(`
      ALTER TABLE "UserOrganization"
      ALTER COLUMN "role" TYPE character varying
      USING role::text
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."UserOrganization_role_enum"
    `);

    await queryRunner.query(`
      ALTER TABLE "OrganizationInvite"
      ALTER COLUMN "status" TYPE character varying
      USING status::text
    `);

    await queryRunner.query(
      'DROP TYPE IF EXISTS "public"."OrganizationInvite_status_enum"'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."OrganizationInvite_status_enum" AS ENUM('pending', 'accepted', 'declined')
    `);

    await queryRunner.query(`
      ALTER TABLE "OrganizationInvite"
      ALTER COLUMN "status" TYPE "public"."OrganizationInvite_status_enum"
      USING status::text::"public"."OrganizationInvite_status_enum"
    `);

    await queryRunner.query(
      'ALTER TABLE "OrganizationInvite" DROP CONSTRAINT "UQ_6019d8b306f388c1e612f206e32"'
    );

    await queryRunner.query(`
      CREATE TYPE "public"."UserOrganization_role_enum" AS ENUM('user', 'admin')
    `);

    await queryRunner.query(`
      ALTER TABLE "UserOrganization"
      ALTER COLUMN "role" TYPE "public"."UserOrganization_role_enum"
      USING role::text::"public"."UserOrganization_role_enum"
    `);

    await queryRunner.query(`
      ALTER TABLE "OrganizationInvite"
      ALTER COLUMN "status" SET DEFAULT 'pending'
    `);

    await queryRunner.query(
      'ALTER TABLE "Attachment" ADD "fileSizeInBytes" integer NOT NULL'
    );
  }
}
