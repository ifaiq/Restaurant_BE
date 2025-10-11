import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MenuItemModifier } from './MenuItemModifier';
import { Restaurant } from './Restaurant';
import { Tenant } from './Tenant';

@Entity()
export class Modifier {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price!: number;

  @Column({ nullable: true })
  picture?: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isRequired!: boolean;

  @Column({ default: false })
  isGlobal!: boolean;

  @ManyToOne(() => Restaurant, { nullable: false })
  @JoinColumn({ name: 'restaurantId' })
  restaurant?: Restaurant;

  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenantId' })
  tenant?: Tenant;

  @OneToMany(() => MenuItemModifier, (mim) => mim.modifier)
  itemLinks!: MenuItemModifier[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
