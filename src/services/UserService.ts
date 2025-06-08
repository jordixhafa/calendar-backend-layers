// User service
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/UserRepository';
import { MailService } from './MailService';

export class UserService {
  static async updateProfile(id: string, data: { name?: string; email?: string; password?: string }) {
    const repo = UserRepository();
    const user = await repo.findOne({ where: { id: id } });
    if (!user) throw new Error('User not found');
    if (data.email && data.email !== user.email) {
      if (await repo.findOne({ where: { email: data.email } })) {
        throw new Error('Email already in use');
      }
      user.email = data.email;
    }
    if (data.name) user.name = data.name;
    if (data.password) user.password = await bcrypt.hash(data.password, 10);
    await repo.save(user);
    return user;
  }

  static async deleteAccount(id: string) {
    const repo = UserRepository();
    await repo.delete(id);
    return;
  }

  static async requestPasswordReset(email: string) {
    const repo = UserRepository();
    const user = await repo.findOne({ where: { email } });
    if (!user) throw new Error('No account with that email');
    const token = await MailService.sendResetEmail(user);
    return token;
  }

  static async resetPassword(token: string, newPassword: string) {
    const userId = await MailService.verifyResetToken(token);
    const repo = UserRepository();
    const user = await repo.findOne({ where: { id: userId } });
    if (!user) throw new Error('Invalid token');
    user.password = await bcrypt.hash(newPassword, 10);
    await repo.save(user);
    return;
  }
}
