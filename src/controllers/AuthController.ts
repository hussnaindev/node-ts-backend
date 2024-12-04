import { Request, Response } from 'express';
import { ContextRequest, ContextResponse, FileParam, FormParam, Path, POST, PUT, Security } from 'typescript-rest';
import { UnauthorizedError } from 'typescript-rest/dist/server/model/errors';
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
                this.authService = new AuthService(this.reqId);
                this.usersService = new UsersService(this.reqId);
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
                existingUser && this.IfUserAlreadyExists();
                const payload = this.generateSignupPayload(name, email, password, phone, userType, profileImg);
                await this.usersService.createUser(payload)
                        .then(newUser => this.sendResponse(res, newUser, 201));
        }


        @POST
        @Path('/login')
        @tryCatch('Failed to login user')
        async login(@ContextRequest req: Request, @ContextResponse res: Response) {
                const { email, password } = req.body;
                const user = await this.usersService.findUserByEmail(email)

                !user && this.IfUserNotFound() // if user is not found
                user && await this.isUserPasswordValid(user, password) // check if passsword is valid
                        .then(_ => this.generateToken(user)) // generate auth token
                        .then(token => this.sendResponse(res, { user, token })) // send response back to the client
        }


        @POST
        @Path('/reset-password')
        @tryCatch('Failed to reset password')
        async resetPassword(@ContextRequest req: Request, @ContextResponse res: Response) {
                const { email, newPassword } = req.body;
                const user = await this.usersService.findUserByEmail(email);

                !user && this.IfUserNotFound(); // if user is not found
                user && await this.authService.resetPassword(user, newPassword) // reset password
                        .then(_ => this.sendResponse(res, { message: 'Password reset successful' })) // send response back to client
        }


        @PUT
        @Path('/change-password')
        @Security([], 'jwt')
        @tryCatch('Failed to change password')
        async changePassword(@ContextRequest req: Request, @ContextResponse res: Response) {
                const { currentPassword, newPassword } = req.body;

                // @ts-ignore
                const userId = req?.user?.id;
                !userId && this.IfRequestIsInvalid();
                const user = await this.usersService.getUserById(userId);
                !user && this.IfUserNotFound(); // if user is not found

                user && await this.isUserPasswordValid(user, currentPassword) // check if passsword is valid
                        .then(_ => this.authService.changePassword(user, newPassword)) // generate auth token
                        .then(_ => this.sendResponse(res, { message: 'Password change successful' })) // send response back to the client
        }

        private async generateToken(user: User) {
                return this.authService.generateToken(user)
        }

        private async isUserPasswordValid(user: User, password: string) {
                const userHashedPassword = (await this.authService.getUserPassword(user.id)) || '';
                const isPasswordValid = await this.authService.verifyPassword(password, userHashedPassword);
                if (!isPasswordValid) throw new UnauthorizedError('Invalid email or password');
                return isPasswordValid;
        }

        private generateSignupPayload(name: string, email: string, password: string, phone: string, userType: 'user' | 'admin', profileImg: Express.Multer.File): UserCreationAttributes {
                const fileName = profileImg ? saveBufferToFile(profileImg) : '';

                return {
                        name,
                        email,
                        password,
                        phone,
                        userType,
                        profileImg: fileName
                };
        }

}
