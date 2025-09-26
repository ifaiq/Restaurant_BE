import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Tenant } from './Tenant';
import {
  IsString,
  MinLength,
  Matches,
  IsEmail,
  IsOptional,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Restaurant } from './Restaurant';

export enum RoleName {
  CUSTOMER = 'CUSTOMER',
  STAFF = 'STAFF',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @Column()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[!@#$%^&*])(?=.*\d).+$/, {
    message:
      'Password must contain at least one special character and one number',
  })
  password!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  uniqueID?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @ManyToOne(() => Restaurant, { nullable: true })
  @JoinColumn({ name: 'restaurantId' })
  @IsOptional()
  restaurantId?: Restaurant;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'manager' })
  @IsOptional()
  manager?: User;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenantId!: Tenant;

  @Column({ default: true })
  isFirstLogin!: boolean;

  @Column({ nullable: true, unique: true })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  doj?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  resetTokenExpiration?: Date | null;

  @Column({
    type: 'enum',
    enum: RoleName,
    default: RoleName.CUSTOMER,
  })
  roleName?: RoleName;

  @Column({ default: false })
  @IsBoolean()
  isAdmin?: boolean;

  @Column({ default: false })
  @IsBoolean()
  isDocViewable?: boolean;

  @Column({ default: false })
  @IsBoolean()
  isActive?: boolean;

  @Column({ default: false })
  @IsBoolean()
  isDeleted?: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  lastLogin?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  normalizeEmail() {
    this.email = this.email?.toLowerCase();
  }
}
