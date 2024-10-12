export interface IJwtUserPayload {
        id: string;
        email: string;
        username: string; // comma-separated list of roles
        roles: string;
        iat: number;
        exp: number;
}

export interface IJwtUser {
        roles: string[];
        id: string;
        username: string;
        email: string;
}
