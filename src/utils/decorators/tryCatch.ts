

import { BadRequestError, NotFoundError } from 'typescript-rest/dist/server/model/errors';

export function tryCatch(message: string) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
                const originalMethod = descriptor.value;

                descriptor.value = async function (...args: any[]) {
                        try {
                                return await originalMethod.apply(this, args);
                        } catch (error: any) {
                                if (error instanceof NotFoundError) {
                                        throw new NotFoundError(error.message); 
                                }
                                if (error instanceof BadRequestError) {
                                        throw new BadRequestError(error.message); 
                                }
                                console.log(error?.message || message);
                                throw new Error(error?.message || message); 
                        }
                };

                return descriptor;
        };
}
