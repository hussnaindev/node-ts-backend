import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { IJwtUser, IJwtUserPayload } from '../types/JWTUser';

const jwtConfig: StrategyOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET || 'secret',
};

// Define the JWT strategy
export const strategy = new Strategy(
        jwtConfig,
        (payload: IJwtUserPayload, done: (error: any, user?: IJwtUser) => void) => {
                const user: IJwtUser = {
                        id: payload.id,
                        email: payload.email,
                        username: payload.username,

                        roles: payload.roles.split(','),
                };
                done(null, user); // Pass user to the next step
        }
);
