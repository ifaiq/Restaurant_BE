import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Role } from './Role';
import { Company } from './Company';
import { Group } from './Group';
import { Feedback } from './Feedback';
import { Department } from './Department';
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

export enum RoleName {
  USER = 'USER',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
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

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  position?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'manager' })
  @IsOptional()
  manager?: User;

  @ManyToOne(() => Department, (department) => department.id)
  @JoinColumn({ name: 'department' })
  @IsOptional()
  department?: Department;

  @ManyToOne(() => Company, (company) => company.id)
  @JoinColumn({ name: 'companyId' })
  company!: Company;

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
    default: RoleName.USER,
  })
  roleName?: RoleName;

  @ManyToOne(() => Role, (role) => role.users, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @IsOptional()
  role?: Role;

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

  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedbacks?: Feedback[];

  @ManyToMany(() => Group, (group) => group.users)
  groups!: Group[];

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
