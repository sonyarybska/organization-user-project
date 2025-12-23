import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { OrganizationEntity } from './OrganizationEntity';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';

@Entity('OrganizationInvite')
export class OrganizationInviteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: OrganizationEntity;

  @Column()
  organizationId: string;

  @Column()
  expiresAt: Date;

  @Column({ unique: true })
  token: string;

  @Column()
  status: InviteStatus;

  @CreateDateColumn()
  createdAt: Date;
}
