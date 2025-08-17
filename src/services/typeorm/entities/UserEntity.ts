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

@Entity('User')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  companyName: string;

  @Column()
  companyUrl: string;

  @Column()
  birthday: Date;

  @Column({ default: false })
  isConfirm: boolean;

  @OneToOne(() => AttachmentEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'avatarId' })
  avatar: AttachmentEntity;

  @Column({ nullable: true })
  avatarId: string;

  @OneToMany(() => UserOrganizationEntity, (user) => user.user)
  userOrganizations: UserOrganizationEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
