import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { UserEntity } from './UserEntity';
import { OrganizationEntity } from './OrganizationEntity';
import { UserRoleEnum } from 'src/types/enums/UserRoleEnum';

@Index(
  'userOrganizationUserIdPerOrganizationId',
  ['userId', 'organizationId'],
  {
    unique: true
  }
)
@Entity('UserOrganization')
export class UserOrganizationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  organizationId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: OrganizationEntity;

  @Column({ type: 'varchar' })
  role: UserRoleEnum;

  @CreateDateColumn()
  createdAt: Date;
}
