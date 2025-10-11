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
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateIf,
  IsEmail,
} from 'class-validator';
import { Tenant } from './Tenant';
import { User } from './User';
import { Table } from './Table';
import { MenuItem } from './MenuItem';

export enum RestaurantType {
  FINE_DINING = 'Fine Dining',
  CASUAL_DINING = 'Casual Dining',
  FAST_FOOD = 'Fast Food',
  FAST_CASUAL = 'Fast Casual',
  CAFE = 'Cafe',
  BISTRO = 'Bistro',
  BUFFET = 'Buffet',
  FOOD_TRUCK = 'Food Truck',
  POP_UP = 'Pop-up Restaurant',
  GHOST_KITCHEN = 'Ghost Kitchen',
  BAR_AND_GRILL = 'Bar and Grill',
  PIZZERIA = 'Pizzeria',
  BAKERY = 'Bakery',
  DELI = 'Deli',
  SEAFOOD = 'Seafood Restaurant',
  STEAKHOUSE = 'Steakhouse',
  ETHNIC = 'Ethnic Restaurant',
  VEGETARIAN = 'Vegetarian Restaurant',
  VEGAN = 'Vegan Restaurant',
  FAMILY = 'Family Restaurant',
}

@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  @IsNotEmpty({ message: 'Restaurant name is required' })
  @IsString({ message: 'Restaurant name must be a string' })
  @MaxLength(100, { message: 'Restaurant name must not exceed 100 characters' })
  restaurantName!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Website must be a string' })
  website!: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  @IsNotEmpty({ message: 'Tenant ID is required' })
  tenantId!: Tenant;

  @Column({ type: 'enum', enum: RestaurantType, nullable: true })
  @IsOptional()
  restaurantType?: RestaurantType;

  @Column({ nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'Seating capacity must be a number' })
  @IsPositive({ message: 'Seating capacity must be a positive number' })
  seatingCapacity?: number;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  @MaxLength(500, { message: 'Address must not exceed 500 characters' })
  address!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'City must be a string' })
  city!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'State must be a string' })
  state!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Country must be a string' })
  country!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Postal code must be a string' })
  postalCode!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email!: string;

  @Column({ nullable: true })
  @IsOptional()
  colourTheme!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Restaurant logo must be a string' })
  restaurantLogo!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description!: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  operatingHours?: Record<string, any>;

  @Column({ nullable: true })
  @IsOptional()
  @IsBoolean({ message: 'isBranch must be a boolean value' })
  isBranch!: boolean;

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'parentRestaurantId' })
  @ValidateIf((o) => o.isBranch)
  @IsOptional()
  parentRestaurantId!: Restaurant;

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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'deletedBy' })
  @IsOptional()
  deletedBy?: User;

  @OneToMany(() => User, (user) => user.restaurantId)
  @IsOptional()
  users?: User[];

  @OneToMany(() => Table, (table) => table.restaurant)
  @IsOptional()
  tables?: Table[];

  @OneToMany(() => MenuItem, (item) => item.restaurant)
  @IsOptional()
  menuItems?: MenuItem[];
}
