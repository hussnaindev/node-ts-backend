import { Response } from "express";
import { NotFoundError } from "typescript-rest/dist/server/model/errors";

export class Controller {
    constructor() {
    }

    IfUserNotFound() {
        throw new NotFoundError('User not found')
    };

    sendResponse(res: Response, data: any, status: number = 200) {
        res.status(200).json(data);
    }

}