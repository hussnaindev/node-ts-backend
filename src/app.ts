import { configDotenv } from 'dotenv';
import express from 'express';
import { PassportAuthenticator, Server } from 'typescript-rest';
import { controllers } from './controllers';
import { strategy } from './middlewares/auth';
import { errorHandler } from './middlewares/errorHandler';
import { IJwtUser } from './types/JWTUser';
configDotenv();

const app = express();

app.use(express.json());
app.use('/uploads', express.static('/src/uploads'));


Server.registerAuthenticator(
        new PassportAuthenticator(strategy, {
                deserializeUser: (user: string) => JSON.parse(user), 
                serializeUser: (user: IJwtUser) => JSON.stringify(user),
        }),
        'jwt'
);

const router = express.Router();
Server.buildServices(router, ...controllers);

app.use('/api/v1', router); 
app.use(errorHandler);

export { app };
