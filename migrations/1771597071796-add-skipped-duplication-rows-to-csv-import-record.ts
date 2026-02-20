import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSkippedDuplicationRowsToCsvImportRecord1771597071796 implements MigrationInterface {
    name = 'AddSkippedDuplicationRowsToCsvImportRecord1771597071796'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "CsvImportRecord" ADD "skippedDuplicationRows" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "CsvImportRecord" DROP COLUMN "skippedDuplicationRows"`);
    }

}
