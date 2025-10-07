import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteIsConfirmAndChangeCognitoIdToRequiredForUser1759434776044 implements MigrationInterface {
    name = 'DeleteIsConfirmAndChangeCognitoIdToRequiredForUser1759434776044';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "User" DROP COLUMN "isConfirm"');
        await queryRunner.query('ALTER TABLE "User" ALTER COLUMN "cognitoUserId" SET NOT NULL');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "User" ALTER COLUMN "cognitoUserId" DROP NOT NULL');
        await queryRunner.query('ALTER TABLE "User" ADD "isConfirm" boolean NOT NULL DEFAULT false');
    }

}
