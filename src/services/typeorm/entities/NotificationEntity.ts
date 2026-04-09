import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Index } from 'typeorm';
import { UserEntity } from './UserEntity';
import { OrganizationEntity } from './OrganizationEntity';
import { NotificationTypeEnum } from 'src/types/enums/NotificationTypeEnum';

@Index(['userId', 'organizationId', 'isRead', 'createdAt'])
@Entity('Notification')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  userId: string;

  @ManyToOne(() => OrganizationEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: OrganizationEntity;

  @Column({ nullable: true })
  organizationId: string;

  @Column({ type: 'varchar' })
  type: NotificationTypeEnum;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
