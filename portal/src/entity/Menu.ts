import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { Restaurant } from './Restaurant';
import { User } from './User';
import { MenuModifier } from './MenuModifier';
import { Tenant } from './Tenant';

export enum MenuStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DRAFT = 'Draft',
  ARCHIVED = 'Archived',
}

export enum MenuType {
  MAIN = 'Main Menu',
  BREAKFAST = 'Breakfast',
  LUNCH = 'Lunch',
  DINNER = 'Dinner',
  DESSERT = 'Dessert',
  BEVERAGE = 'Beverage',
  WINE = 'Wine',
  COCKTAIL = 'Cocktail',
  KIDS = 'Kids Menu',
  VEGETARIAN = 'Vegetarian',
  VEGAN = 'Vegan',
  SEASONAL = 'Seasonal',
  SPECIAL = 'Special',
}

@Entity()
export class Menu {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  @IsNotEmpty({ message: 'Menu name is required' })
  @IsString({ message: 'Menu name must be a string' })
  @MaxLength(100, { message: 'Menu name must not exceed 100 characters' })
  menuName!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description!: string;

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurantId' })
  @IsNotEmpty({ message: 'Restaurant ID is required' })
  restaurantId!: Restaurant;

  @Column({ type: 'enum', enum: MenuType, default: MenuType.MAIN })
  @IsOptional()
  @IsEnum(MenuType, { message: 'Invalid menu type' })
  menuType?: MenuType;

  @Column({
    type: 'enum',
    enum: MenuStatus,
    default: MenuStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(MenuStatus, { message: 'Invalid menu status' })
  status?: MenuStatus;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Language must be a string' })
  language!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Currency must be a string' })
  @MaxLength(3, { message: 'Currency must not exceed 3 characters' })
  currency!: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  categories?: Record<string, any>;

  @Column({ default: true })
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;

  @Column({ default: false })
  @IsBoolean({ message: 'isDeleted must be a boolean value' })
  isDeleted?: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenantId!: Tenant;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'deletedBy' })
  @IsOptional()
  deletedBy?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  @IsOptional()
  createdBy?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updatedBy' })
  @IsOptional()
  updatedBy?: User;

  @OneToMany(() => MenuModifier, (modifier) => modifier.menu)
  @IsOptional()
  modifiers?: MenuModifier[];
}
