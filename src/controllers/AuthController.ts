import { Request, Response } from 'express';
import { ContextRequest, ContextResponse, FileParam, FormParam, Path, POST, PUT, Security } from 'typescript-rest';
import { BadRequestError, NotFoundError, UnauthorizedError } from 'typescript-rest/dist/server/model/errors';
import User, { UserCreationAttributes } from '../models/sequelize/UserModel';
import { AuthService } from '../services/AuthService';
import { UsersService } from '../services/UsersService';
import { tryCatch } from '../utils/decorators/tryCatch';
import { saveBufferToFile } from '../utils/files';
import { Controller } from './Controller';

@Path('/auth')
export class AuthController extends Controller {
        private authService: AuthService;
        private usersService: UsersService;

        constructor() {
                super()
                this.authService = new AuthService();
                this.usersService = new UsersService();
        }


        @POST
        @Path('/signup')
        @tryCatch('Failed to sign up user')
        async signup(
                @FormParam('name') name: string,
                @FormParam('email') email: string,
                @FormParam('password') password: string,
                @FormParam('phone') phone: string,
                @FormParam('userType') userType: 'user' | 'admin',
                @FileParam('profileImg') profileImg: Express.Multer.File,
                @ContextResponse res: Response
        ) {

                const existingUser = await this.usersService.findUserByEmail(email);
                if (existingUser) {
                        throw new BadRequestError('User with this email already exists');
                }

                const fileName = profileImg ? saveBufferToFile(profileImg) : '';

                const userData: UserCreationAttributes = {
                        name,
                        email,
                        password,
                        phone,
                        userType: userType,
                        profileImg: fileName
                };

                const newUser = await this.usersService.createUser(userData);
                res.status(201).json(newUser);
        }


        @POST
        @Path('/login')
        @tryCatch('Failed to login user')
        async login(@ContextRequest req: Request, @ContextResponse res: Response) {
                const { email, password } = req.body;

                const handleResponse = async (user: User | null) => {
                        !user && this.IfUserNotFound();
                        user && (await this.isUserPasswordValid(user, password)) && this.generateToken(user).then(token => this.sendResponse(res, { user, token }));
                }

                await this.usersService.findUserByEmail(email).then(handleResponse);
        }


        @POST
        @Path('/reset-password')
        @tryCatch('Failed to reset password')
        async resetPassword(@ContextRequest req: Request, @ContextResponse res: Response) {
                const { email, newPassword } = req.body;


                const user = await this.usersService.findUserByEmail(email);
                if (!user) {
                        throw new NotFoundError('User not found');
                }


                await this.authService.resetPassword(user, newPassword);
                res.status(200).json({ message: 'Password reset successful' });
        }


        @PUT
        @Path('/change-password')
        @Security([], 'jwt')
        @tryCatch('Failed to change password')
        async changePassword(@ContextRequest req: Request, @ContextResponse res: Response) {
                const { currentPassword, newPassword } = req.body;

                // @ts-ignore
                const userId = req?.user?.id;

                if (!userId) {
                        throw new BadRequestError('Bad Request');
                }


                const user = await this.usersService.getUserById(userId);
                if (!user) {
                        throw new NotFoundError('User not found');
                }

                const userHashedPassword = (await this.authService.getUserPassword(user.id)) || '';


                const isPasswordValid = await this.authService.verifyPassword(currentPassword, userHashedPassword);
                if (!isPasswordValid) {
                        throw new UnauthorizedError('Current password is incorrect');
                }


                await this.authService.changePassword(user, newPassword);
                res.status(200).json({ message: 'Password change successful' });
        }

        private generateToken = async (user: User) => {
                return this.authService.generateToken(user)
        }

        private isUserPasswordValid = async (user: User, password: string) => {
                const userHashedPassword = (await this.authService.getUserPassword(user.id)) || '';
                const isPasswordValid = await this.authService.verifyPassword(password, userHashedPassword);
                if (!isPasswordValid) throw new UnauthorizedError('Invalid email or password');
                return isPasswordValid;
        }

}
