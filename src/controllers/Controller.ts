import { Response } from "express";
import { BadRequestError, NotFoundError } from "typescript-rest/dist/server/model/errors";

export class Controller {
    constructor() {
    }

    IfUserNotFound() {
        throw new NotFoundError('User not found')
    };

    IfRequestIsInvalid() {
        throw new BadRequestError('Bad Request')
    };


    IfUserAlreadyExists() {
        throw new NotFoundError('User with this email already exists')
    };

    sendResponse(res: Response, data: any, status: number = 200) {
        res.status(200).json(data);
    }

}