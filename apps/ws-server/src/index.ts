import { URLSearchParams } from "url";
import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const wss = new WebSocketServer({port: 8080})

wss.on("connection", function connection(ws, request){
    const url = request.url
    console.log(url)

    if(!url){
        return;
    }

    const param = new URLSearchParams(url.split('?')[1])
    console.log(param);
    
    const token = param.get('token') ?? ""
    console.log(token);
    
    const decoded = jwt.verify(token, process.env.JWT) as JwtPayload
    console.log(process.env.JWT);
    
    console.log(typeof decoded);
    
    if( !decoded || !decoded.userId){
        ws.close()
        return;
    }
    ws.on("error", console.error)

    ws.on("message", function message(data){
        ws.send("pong")
    })

    
})