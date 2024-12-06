// app.ts
import { configDotenv } from 'dotenv';
import express from 'express';
import 'reflect-metadata';
import { PassportAuthenticator, Server } from 'typescript-rest';
import { controllers } from './controllers';
import Swagger from './integrations/swagger/Swagger';
import { APIRateLimiter } from './middlewares/APIRateLimiter';
import { strategy } from './middlewares/auth';
import { errorHandler } from './middlewares/errorHandler';
import { IJwtUser } from './types/JWTUser';

configDotenv();

const app = express();
app.use(express.json());
app.use('/uploads', express.static('/src/uploads'));

const swagger = Swagger.getInstance();
swagger.setupSwaggerUi(app);


// Register authenticator
Server.registerAuthenticator(
        new PassportAuthenticator(strategy, {
                deserializeUser: (user: string) => JSON.parse(user),
                serializeUser: (user: IJwtUser) => JSON.stringify(user),
        }),
        'jwt'
);

// default rate limiter
// [Note: for individual rate limiters, create separate routers and use separate middlewares]

/* For example: 
        const usersRouter = express.Router();
        usersRouter.use(usersRateLimiter);
        Server.buildServices(usersRouter, ...controllers);
        app.use('/api/v1/users', usersRouter);
*/

app.use(APIRateLimiter());
const router = express.Router();
Server.buildServices(router, ...controllers);

app.use('/api/v1', router);
app.use(errorHandler);

export { app };
