import { configDotenv } from 'dotenv';
import express from 'express';
import client from 'prom-client'; // Prometheus client for metrics
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

// Setup Swagger
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

// Prometheus Metrics Setup
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Example Custom Metric
const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
});
register.registerMetric(httpRequestDuration);

// Middleware to collect metrics
app.use((req, res, next) => {
    const end = httpRequestDuration.startTimer();
    res.on('finish', () => {
        end({ method: req.method, route: req.route?.path || req.url, status: res.statusCode });
    });
    next();
});

// Metrics endpoint for Prometheus to scrape
app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
});

// Build routes with TypeScript-Rest
const router = express.Router();
Server.buildServices(router, ...controllers);
app.use('/api/v1', router);

// Error handling middleware
app.use(errorHandler);

export { app };
