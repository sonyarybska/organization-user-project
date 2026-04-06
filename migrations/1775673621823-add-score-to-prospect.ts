import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScoreToProspect1775673621823 implements MigrationInterface {
  name = 'AddScoreToProspect1775673621823';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "Prospect" ADD "score" integer NOT NULL DEFAULT 0');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "Prospect" DROP COLUMN "score"');
  }
}
