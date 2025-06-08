// Auth service
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { jwtConfig } from '../config/jwt';

export class AuthService {
  static async register(name: string, email: string, password: string) {
    const repo = UserRepository();
    if (await repo.findOne({ where: { email } })) {
      throw new Error('Email already in use');
    }
    const hash = await bcrypt.hash(password, 10);
    const user = repo.create({ name, email, password: hash });
    await repo.save(user);
    return user;
  }

  static async login(email: string, password: string) {
    const repo = UserRepository();
    const user = await repo.findOne({ where: { email } });
    if (!user) throw new Error('Invalid credentials');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid credentials');

    const token = (jwt.sign as any)({ sub: user.id },jwtConfig.secret,{ expiresIn: jwtConfig.expiresIn });

    return { user, token };
  }
}
