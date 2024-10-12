import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/sequelize/UserModel';

export class AuthService {
        async hashPassword(password: string): Promise<string> {
                const saltRounds = 10;
                return await bcrypt.hash(password, saltRounds);
        }

        async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
                return await bcrypt.compare(password, hashedPassword);
        }

        generateToken(user: User): string {
                const payload = {
                        id: user.id,
                        username: user.name,
                        email: user.email,
                        roles: user.userType,
                };
                return jwt.sign(payload, process.env.JWT_SECRET || '', { expiresIn: '1h' });
        }

        async resetPassword(user: User, newPassword: string) {
                const hashedPassword = await this.hashPassword(newPassword);
                await user.update({ password: hashedPassword });
        }

        async changePassword(user: User, newPassword: string) {
                const hashedPassword = await this.hashPassword(newPassword);
                await user.update({ password: hashedPassword });
        }

        async getUserPassword(userId: number) {
                return (await User.findByPk(userId, { attributes: ['password'] }))?.password;
        }
}
