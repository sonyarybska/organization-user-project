import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { UserEntity } from './UserEntity';
import { OrganizationEntity } from './OrganizationEntity';
import { CsvImportStatusEnum } from 'src/types/enums/CsvImportStatusEnum';

@Entity('CsvImportRecord')
export class CsvImportRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  key: string;

  @ManyToOne(() => OrganizationEntity, (org) => org.csvImports, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'organizationId' })
  organization: OrganizationEntity;

  @Column()
  organizationId: string;

  @ManyToOne(() => UserEntity, (user) => user.csvImports, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: CsvImportStatusEnum,
    default: CsvImportStatusEnum.NEW
  })
  status: CsvImportStatusEnum;

  @Column({  nullable: true })
  totalRows: number;

  @Column({  nullable: true })
  processedRows: number;

  @Column({ nullable: true })
  failedRows: number;

  @Column({ nullable: true })
  lastError: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
