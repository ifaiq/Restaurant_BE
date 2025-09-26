import { MigrationInterface, QueryRunner } from 'typeorm';
import { User } from '../entity/User';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';

export class SeedUsers implements MigrationInterface {
  public async up(): Promise<void> {
    const userRepo = AppDataSource.getRepository(User);

    const users = [
      {
        name: 'Faiq Admin',
        email: 'faiq55@yahoo.com',
        password: await bcrypt.hash('password123', 10),
        isActive: true,
      },
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: await bcrypt.hash('password123', 10),
        isActive: true,
      },
    ];

    for (const user of users) {
      const newUser = userRepo.create(user);
      await userRepo.save(newUser);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM user WHERE email IN ('faiq55@yahoo.com', 'jane@example.com')`,
    );
  }
}
