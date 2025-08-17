import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Attachment')
export class AttachmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column()
  key: string;

  @Column()
  publicKey: string;

  @Column()
  userId: string;

  @Column()
  fileSizeInBytes: number;
}
