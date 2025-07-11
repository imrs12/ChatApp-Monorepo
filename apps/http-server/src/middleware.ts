import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import { decode } from "punycode";

// interface IRequest extends Request {
//     userId?: string
// }

// interface IJWT extends JwtPayload{
//     userId: string
// }

export function middleware( req: Request, res: Response , next: NextFunction){
    const token = req.headers["authorization"] ?? "" ;

    if(!token || token === ""){
        res.status(411).json({
            message: "Token Missing"
        })
        return;
    }

    const decoded = jwt.verify(token, process.env.JWT) as JwtPayload;
    console.log(process.env.JWT)
    console.log(decoded)

    if(decoded){
        req.userId = decoded.userId
        console.log(req.userId);
        
        next()
    } else{
        res.status(411).json({
            message: "UnAuthorised"
        })
    }
}