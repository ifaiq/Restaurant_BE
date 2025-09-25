import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Tenant } from './Tenant';

@Entity()
export class DocumentType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  documentType!: string;

  @Column({ nullable: true })
  documentDescription?: string;

  @Column({ nullable: true })
  abbreviation?: string;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenantId!: Tenant;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;

  @Column({ nullable: true, default: false })
  isDeleted?: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'deletedBy' })
  @Column({ nullable: true })
  deletedBy?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updatedBy' })
  @Column({ nullable: true })
  updatedBy?: User;
}
