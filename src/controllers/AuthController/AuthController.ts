import { Request, Response } from 'express';
import { ContextRequest, ContextResponse, FileParam, FormParam, Path, POST, PUT, Security } from 'typescript-rest';
import { UnauthorizedError } from 'typescript-rest/dist/server/model/errors';
import { LOG_GROUPS, LOG_STREAMS } from '../../constants/constants';
import User, { UserCreationAttributes } from '../../models/sequelize/UserModel';
import { AuthService } from '../../services/AuthService';
import { UsersService } from '../../services/UsersService';
import { tryCatch } from '../../utils/decorators/tryCatch';
import { saveBufferToFile } from '../../utils/files';
import Logger from '../../utils/Logger';
import { Controller } from '../Controller';

@Path('/auth')
export class AuthController extends Controller {
        private authService: AuthService;
        private usersService: UsersService;
        private logger: Logger;

        constructor() {
                super()
                this.authService = new AuthService(this.reqId);
                this.usersService = new UsersService(this.reqId);
                this.logger = new Logger(LOG_GROUPS.NODE_SERVER_LOGS, LOG_STREAMS.REQUEST_LOGS, this.reqId);
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
                this.logger.info(`Signing up with email ${email}...`);
                const existingUser = await this.usersService.findUserByEmail(email);
                existingUser && this.IfUserAlreadyExists();
                const payload = this.generateSignupPayload(name, email, password, phone, userType, profileImg);
                const newUser = await this.usersService.createUser(payload)
                this.logger.info(`Signed up successfully with email ${email}!`);
                this.sendResponse(res, newUser, 201);
        }


        @POST
        @Path('/login')
        @tryCatch('Failed to login user')
        async login(@ContextRequest req: Request, @ContextResponse res: Response) {
                const { email, password } = req.body;
                this.logger.info(`Logging in with email ${email}...`);
                const user = await this.usersService.findUserByEmail(email)

                !user && this.IfUserNotFound() // if user is not found
                user && await this.isUserPasswordValid(user, password) // check if passsword is valid
                        .then(_ => this.generateToken(user)) // generate auth token
                        .then(token => this.sendResponse(res, { user, token })) // send response back to the client
                        .then(_ => this.logger.info(`Logged in successfully with email ${email}`));
        }


        @POST
        @Path('/reset-password')
        @tryCatch('Failed to reset password')
        async resetPassword(@ContextRequest req: Request, @ContextResponse res: Response) {
                const { email, newPassword } = req.body;
                this.logger.info(`Resetting password for email ${email}...`);
                const user = await this.usersService.findUserByEmail(email);

                !user && this.IfUserNotFound(); // if user is not found
                user && await this.authService.resetPassword(user, newPassword) // reset password
                        .then(_ => this.sendResponse(res, { message: 'Password reset successful' })) // send response back to client
                        .then(_ => this.logger.info(`Password reset successful for email ${email}`));
        }


        @PUT
        @Path('/change-password')
        @Security([], 'jwt')
        @tryCatch('Failed to change password')
        async changePassword(@ContextRequest req: Request, @ContextResponse res: Response) {
                const { currentPassword, newPassword } = req.body;
                this.logger.info(`Changing password...`);

                // @ts-ignore
                const userId = req?.user?.id;
                !userId && this.IfRequestIsInvalid();
                const user = await this.usersService.getUserById(userId);
                !user && this.IfUserNotFound(); // if user is not found

                user && await this.isUserPasswordValid(user, currentPassword) // check if passsword is valid
                        .then(_ => this.authService.changePassword(user, newPassword)) // generate auth token
                        .then(_ => this.sendResponse(res, { message: 'Password change successful' })) // send response back to the client
                        .then(_ => this.logger.info('Pasword changed successfully!'))
        }

        private async generateToken(user: User) {
                return this.authService.generateToken(user)
        }

        private async isUserPasswordValid(user: User, password: string) {
                this.logger.info('Checking if user password is valid...');
                const userHashedPassword = (await this.authService.getUserPassword(user.id)) || '';
                const isPasswordValid = await this.authService.verifyPassword(password, userHashedPassword);
                if (!isPasswordValid) throw new UnauthorizedError('Invalid email or password');
                this.logger.info('Password validated successfully!');
                return isPasswordValid;
        }

        private generateSignupPayload(name: string, email: string, password: string, phone: string, userType: 'user' | 'admin', profileImg: Express.Multer.File): UserCreationAttributes {
                this.logger.info('Generating signup payload...');
                const fileName = profileImg ? saveBufferToFile(profileImg) : '';
                const payload = {
                        name,
                        email,
                        password,
                        phone,
                        userType,
                        profileImg: fileName
                };

                this.logger.debug('Payload generated: ', payload);
                return payload
        }

}
