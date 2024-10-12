import { BadRequestError, NotFoundError } from 'typescript-rest/dist/server/model/errors';
import User, { UserCreationAttributes } from '../models/sequelize/UserModel';
import { tryCatch } from '../utils/decorators/tryCatch';
import { AuthService } from './AuthService';

export class UsersService {
        @tryCatch('Failed to create user')
        async createUser(userData: UserCreationAttributes) {
                const existingUser = await this.findUserByEmail(userData.email);
                if (existingUser) {
                        throw new BadRequestError('User with this email already exists');
                }
                const hashedPassword = await new AuthService().hashPassword(userData.password);
                const user = await User.create({ ...userData, password: hashedPassword });
                const { password, ...userWithoutPassword } = user.dataValues;
                return userWithoutPassword;
        }

        @tryCatch('Failed to find user by email')
        async findUserByEmail(email: string) {
                return await User.findOne({ where: { email }, attributes: { exclude: ['password'] } });
        }

        @tryCatch('Failed to fetch user by ID')
        async getUserById(userId: number) {
                const user = await User.findByPk(userId, {
                        attributes: { exclude: ['password'] },
                });
                if (!user) throw new NotFoundError('User not found');
                return user;
        }

        @tryCatch('Failed to update user')
        async updateUser(userId: number, updateData: Partial<UserCreationAttributes>) {
                const user = await User.findByPk(userId, {
                        attributes: { exclude: ['password'] },
                });
                if (!user) throw new NotFoundError('User not found');
                await user.update(updateData);
                return user;
        }

        @tryCatch('Failed to delete user')
        async deleteUser(userId: number) {
                const user = await User.findByPk(userId, {
                        attributes: { exclude: ['password'] },
                });
                if (!user) throw new NotFoundError('User not found');
                await user.destroy();
                return true;
        }

        @tryCatch('Failed to fetch all users')
        async getAllUsers() {
                return await User.findAll({
                        attributes: { exclude: ['password'] },
                });
        }
}
