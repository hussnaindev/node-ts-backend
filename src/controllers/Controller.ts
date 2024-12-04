import { Response } from "express";
import { BadRequestError, NotFoundError } from "typescript-rest/dist/server/model/errors";
import { v4 as uuid } from 'uuid';
export class Controller {
    public reqId: string;
    
    constructor() {
        this.reqId = uuid();
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