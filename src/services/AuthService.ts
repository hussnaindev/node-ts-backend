import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { LOG_GROUPS, LOG_STREAMS } from '../constants/constants';
import User from '../models/sequelize/UserModel';
import Logger from '../utils/Logger';
import { tryCatch } from '../utils/decorators/tryCatch';
export class AuthService {
        private logger: Logger;

        constructor(reqId?: string) {
                this.logger = new Logger(LOG_GROUPS.NODE_SERVER_LOGS, LOG_STREAMS.REQUEST_LOGS, reqId);
        }

        @tryCatch('Failed to hash password')
        async hashPassword(password: string): Promise<string> {
                this.logger.info('Hashing password...')
                const saltRounds = 10;
                const hashedPass = await bcrypt.hash(password, saltRounds)
                this.logger.info('Password hashed successfully!')
                return hashedPass;
        }

        @tryCatch('Failed to verify the password')
        async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
                this.logger.info('verifying password...')
                const res = await bcrypt.compare(password, hashedPassword);
                this.logger.info('Password verification process completed!')
                return res;
        }

        @tryCatch('Failed to generate the token')
        generateToken(user: User): string {
                this.logger.info(`Generating token...`)
                const payload = {
                        id: user.id,
                        username: user.name,
                        email: user.email,
                        roles: user.userType,
                };
                const res = jwt.sign(payload, process.env.JWT_SECRET || '', { expiresIn: '1h' });
                this.logger.info(`Token generated successfully`);
                return res;
        }

        @tryCatch('Failed to reset the password')
        async resetPassword(user: User, newPassword: string) {
                this.logger.info(`Resetting password...`)
                const hashedPassword = await this.hashPassword(newPassword);
                await user.update({ password: hashedPassword });
                this.logger.info(`Password reset successfully!`)
        }

        @tryCatch('Failed to change the password')
        async changePassword(user: User, newPassword: string) {
                this.logger.info(`Changing password...`)
                const hashedPassword = await this.hashPassword(newPassword);
                await user.update({ password: hashedPassword });
                this.logger.info(`Password changed successfully!`)
        }

        @tryCatch('Failed to fetch user password')
        async getUserPassword(userId: number) {
                this.logger.info(`Fetching user password...`);
                const res = (await User.findByPk(userId, { attributes: ['password'] }))?.password;
                this.logger.info(`User password fetched successfully!`);
                return res;
        }
}
