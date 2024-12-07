import { BadRequestError, NotFoundError } from 'typescript-rest/dist/server/model/errors';
import { LOG_GROUPS, LOG_STREAMS } from '../constants/constants';
import User, { UserCreationAttributes } from '../models/sequelize/UserModel';
import { tryCatch } from '../utils/decorators/tryCatch';
import Logger from '../utils/Logger';
import { AuthService } from './AuthService';
export class UsersService {
        private logger: Logger;

        constructor(reqId?: string) {
                this.logger = new Logger(LOG_GROUPS.NODE_SERVER_LOGS, LOG_STREAMS.REQUEST_LOGS, reqId);
        }

        @tryCatch('Failed to create user')
        async createUser(userData: UserCreationAttributes) {
                this.logger.info('Create a new user...');
                const existingUser = await this.findUserByEmail(userData.email);
                if (existingUser) {
                        throw new BadRequestError('User with this email already exists');
                }
                const hashedPassword = await new AuthService().hashPassword(userData.password);
                const user = await User.create({ ...userData, password: hashedPassword });
                const { password, ...userWithoutPassword } = user.dataValues;
                this.logger.info('New user created successfully!');
                return userWithoutPassword;
        }

        @tryCatch('Failed to find user by email')
        async findUserByEmail(email: string) {
                return User.findOne({ where: { email }, attributes: { exclude: ['password'] } });
        }

        @tryCatch('Failed to fetch user by ID')
        async getUserById(userId: number) {
                this.logger.info(`Fetching user by id ${userId}...`)
                const user = await User.findByPk(userId, {
                        attributes: { exclude: ['password'] },
                });
                if (!user) throw new NotFoundError('User not found');
                this.logger.info(`User fetched by id successfully!`)
                return user;
        }

        @tryCatch('Failed to update user')
        async updateUser(userId: number, updateData: Partial<UserCreationAttributes>) {
                this.logger.info(`Updating user by id ${userId}...`)
                const user = await User.findByPk(userId, {
                        attributes: { exclude: ['password'] },
                });
                if (!user) throw new NotFoundError('User not found');
                await user.update(updateData);
                this.logger.info(`User updated by id successfully!`)
                return user;
        }

        @tryCatch('Failed to delete user')
        async deleteUser(userId: number) {
                this.logger.info(`Deleting user by id ${userId}...`)
                const user = await User.findByPk(userId, {
                        attributes: { exclude: ['password'] },
                });
                if (!user) throw new NotFoundError('User not found');
                await user.destroy();
                this.logger.info(`User deleted by id ${userId}...`)
                return true;
        }

        @tryCatch('Failed to fetch all users')
        async getAllUsers() {
                return User.findAll({
                        attributes: { exclude: ['password'] },
                });
        }
}
