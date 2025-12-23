import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteIsConfirmAndMakeCognitoIdRequiredForUser1766489953926 implements MigrationInterface {
    name = 'DeleteIsConfirmAndMakeCognitoIdRequiredForUser1766489953926';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "User" DROP COLUMN "isConfirm"');
        await queryRunner.query('ALTER TABLE "User" ALTER COLUMN "cognitoUserId" SET NOT NULL');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "User" ALTER COLUMN "cognitoUserId" DROP NOT NULL');
        await queryRunner.query('ALTER TABLE "User" ADD "isConfirm" boolean NOT NULL DEFAULT false');
    }

}
