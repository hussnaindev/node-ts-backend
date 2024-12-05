import { Request, Response } from 'express';
import { ContextRequest, ContextResponse, DELETE, FileParam, FormParam, GET, Path, PathParam, POST, PUT } from 'typescript-rest';
import { BadRequestError, NotFoundError } from 'typescript-rest/dist/server/model/errors';
import { v4 as uuid } from 'uuid';
import { LOG_GROUPS, LOG_STREAMS } from '../../constants/constants';
import { UserCreationAttributes } from '../../models/sequelize/UserModel';
import { UsersService } from '../../services/UsersService';
import { tryCatch } from '../../utils/decorators/tryCatch';
import { saveBufferToFile } from '../../utils/files';
import Logger from '../../utils/Logger';

@Path('/users')
export class UsersController {
        private usersService: UsersService;
        private logger: Logger;

        constructor() {
                const reqId = uuid()
                this.usersService = new UsersService();
                this.logger = new Logger(LOG_GROUPS.NODE_SERVER_LOGS, LOG_STREAMS.REQUEST_LOGS, reqId);
        }

        @POST
        @Path('/')
        @tryCatch('Failed to create user')
        async createUser(
                @FormParam('name') name: string,
                @FormParam('email') email: string,
                @FormParam('password') password: string,
                @FormParam('phone') phone: string,
                @FormParam('userType') userType: 'user' | 'admin',
                @FileParam('profileImg') profileImg: Express.Multer.File,
                @ContextResponse res: Response
        ) {
                // Check if user already exists
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

        @GET
        @Path('/')
        @tryCatch('Failed to fetch users')
        async getAllUsers(@ContextResponse res: Response) {
                this.logger.info(`Fetching all users...`);
                const users = await this.usersService.getAllUsers();
                this.logger.debug(`Fetched users successfully`, users);
                res.status(200).json(users);
        }

        @GET
        @Path('/:id')
        @tryCatch('Failed to fetch user')
        async getUser(@PathParam('id') id: number, @ContextResponse res: Response) {
                const user = await this.usersService.getUserById(id);
                if (!user) {
                        throw new NotFoundError('User not found');
                }
                res.status(200).json(user);
        }

        @PUT
        @Path('/:id')
        @tryCatch('Failed to update user')
        async updateUser(@PathParam('id') id: number, @ContextRequest req: Request, @ContextResponse res: Response) {
                const updateData: Partial<UserCreationAttributes> = req.body;
                const updatedUser = await this.usersService.updateUser(id, updateData);
                if (!updatedUser) {
                        throw new NotFoundError('User not found');
                }
                res.status(200).json(updatedUser);
        }

        @DELETE
        @Path('/:id')
        @tryCatch('Failed to delete user')
        async deleteUser(@PathParam('id') id: number, @ContextResponse res: Response) {
                const success = await this.usersService.deleteUser(id);
                if (!success) {
                        throw new NotFoundError('User not found');
                }
                res.status(204).send();
        }
}
