import * as express from "express"
import jwt from "jsonwebtoken"

declare global {
    namespace NodeJS{
        interface ProcessEnv{
            DATABASE_URL: string,
            JWT: string,
            userId: string
        }
    }
}

declare global {
    namespace Express {
        interface Request{
            userId : string
        }
    }
}

declare module "jsonwebtoken" {
    export interface JwtPayload{
        userId : string
    }
}

export {}