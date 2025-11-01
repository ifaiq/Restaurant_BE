import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Category } from './Category';
import { MenuItemModifier } from './MenuItemModifier';
import { Restaurant } from './Restaurant';
import { IsNotEmpty } from 'class-validator';
import { Tenant } from './Tenant';

@Entity()
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menuItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurantId' })
  restaurant!: Restaurant;

  @Column({ length: 100 })
  itemName!: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  @IsNotEmpty({ message: 'Tenant ID is required' })
  tenantId!: Tenant;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ nullable: true })
  picture?: string;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category?: Category;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isVegetarian!: boolean;

  @Column({ default: false })
  isVegan!: boolean;

  @Column({ default: false })
  isGlutenFree!: boolean;

  @Column({ default: false })
  isSpicy!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  nutritionalInfo?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  customizations?: Record<string, any>;

  @OneToMany(() => MenuItemModifier, (mim) => mim.menuItem, { cascade: true })
  modifierLinks!: MenuItemModifier[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
