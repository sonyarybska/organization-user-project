import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSkippedRowsToCsvImportRecord1771597071796 implements MigrationInterface {
    name = 'AddSkippedRowsToCsvImportRecord1771597071796';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "CsvImportRecord" ADD "skippedRows" integer');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "CsvImportRecord" DROP COLUMN "skippedRows"');
    }

}
