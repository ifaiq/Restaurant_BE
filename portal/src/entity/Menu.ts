import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Restaurant } from './Restaurant';
import { Tenant } from './Tenant';
import { User } from './User';

export enum MenuStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DRAFT = 'Draft',
  ARCHIVED = 'Archived',
}

@Entity()
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  menuName!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => Restaurant, { nullable: false })
  @JoinColumn({ name: 'restaurantId' })
  restaurant!: Restaurant;

  @Column({ type: 'enum', enum: MenuStatus, default: MenuStatus.ACTIVE })
  status!: MenuStatus;

  @Column({ nullable: true })
  language?: string;

  @Column({ nullable: true, length: 3 })
  currency?: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant!: Tenant;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  createdBy?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updatedBy' })
  updatedBy?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'deletedBy' })
  deletedBy?: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
