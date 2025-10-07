import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { UserOrganizationEntity } from './UserOrganizationEntity';
import { AttachmentEntity } from './AttachmentEntity';
import { ProspectEntity } from './ProspectEntity';
import { CsvImportRecordEntity } from './CsvImportRecordEntity';

@Entity('User')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  cognitoUserId: string;

  @Column({ nullable: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  companyUrl: string;

  @Column({ nullable: true })
  birthday: Date;

  @OneToOne(() => AttachmentEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'avatarId' })
  avatar: AttachmentEntity;

  @Column({ nullable: true })
  avatarId: string;

  @OneToMany(() => UserOrganizationEntity, (user) => user.user)
  userOrganizations: UserOrganizationEntity[];

  @OneToMany(() => ProspectEntity, (prospect) => prospect.user)
  prospects: ProspectEntity[];

  @OneToMany(() => CsvImportRecordEntity, (csv) => csv.user)
  csvImports: CsvImportRecordEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
