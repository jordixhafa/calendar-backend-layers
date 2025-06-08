// Mail service
import { mailTransport } from '../config/mail';
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { User } from '../models/User';

export class MailService {
  static async sendResetEmail(user: User) {
    const token = jwt.sign({ sub: user.id }, jwtConfig.secret, { expiresIn: '15m' });
    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await mailTransport.sendMail({
      to: user.email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${link}">aquí</a> para restablecer tu contraseña.</p>`
    });
    return token;
  }

  static async verifyResetToken(token: string): Promise<string> {
    try {
      const payload = jwt.verify(token, jwtConfig.secret) as any;
      return payload.sub;
    } catch {
      throw new Error('Invalid or expired token');
    }
  }
}
