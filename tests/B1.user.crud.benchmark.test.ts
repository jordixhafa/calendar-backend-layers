import { DataSource } from 'typeorm';
import { User } from '../src/models/User';
import { AppDataSource } from '../src/config/db'; 

jest.setTimeout(500000); 

let dataSource: DataSource;

const createTestUser = (index: number): Partial<User> => ({
  name: `Test User ${index}`,
  email: `user${index}@example.com`,
  password: `password${index}`
});

const N = 100; // Number of users

beforeAll(async () => {
  dataSource = await AppDataSource.initialize();
  await dataSource.createQueryBuilder().delete().from(User).execute();
});

afterAll(async () => {
  await dataSource.destroy(); 
});

describe(`CRUD operations for ${N} users`, () => {
  const createdUsers: User[] = [];

  it(`should create ${N} users`, async () => {
    for (let i = 0; i < N; i++) {
      const userRepo = dataSource.getRepository(User);
      const userData = createTestUser(i);
      const user = userRepo.create(userData);
      const savedUser = await userRepo.save(user);
      createdUsers.push(savedUser);
      expect(savedUser.id).toBeDefined();
    }
  });

  it('should read all created users', async () => {
    const userRepo = dataSource.getRepository(User);
    for (const user of createdUsers) {
      const foundUser = await userRepo.findOneByOrFail({ email: user.email });
      expect(foundUser.name).toBe(user.name);
    }
  });

  it('should update all users', async () => {
    const userRepo = dataSource.getRepository(User);
    for (const user of createdUsers) {
      user.name += ' Updated';
      const updated = await userRepo.save(user);
      expect(updated.name).toMatch(/Updated$/);
    }
  });

  it('should delete all users', async () => {
    const userRepo = dataSource.getRepository(User);
    for (const user of createdUsers) {
      await userRepo.delete(user.id);
      const deleted = await userRepo.findOneBy({ id: user.id });
      expect(deleted).toBeNull();
    }
  });
});
