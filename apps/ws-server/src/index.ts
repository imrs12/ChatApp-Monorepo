import { URLSearchParams } from "url";
import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import {prismaClient} from "@repo/database/index"

dotenv.config()

const wss = new WebSocketServer({port: 8080})
interface User {
    ws: WebSocket,
    rooms: string[],
    userId: string
}

const users: User[] = []

function CheckUser(token: string): string | null{
    try {
        const decoded = jwt.verify(token, process.env.JWT)

        if (typeof decoded == 'string') {
            return null
        }

        if( !decoded || !decoded.userId){
            return null;
        }
        return decoded.userId
    } catch (error) {
        return null
    }
}

wss.on("connection", function connection(ws, request){
    const url = request.url
    if(!url){
        return;
    }
    
    const param = new URLSearchParams(url.split('?')[1])
    const token = param.get('token') ?? ""
    const userId = CheckUser(token)

    if(userId == null){
        ws.close();
        return null;
    }

    users.push({
        ws,
        rooms: [],
        userId
    })
    
    ws.on("message", async (message)=>{
        let parsedData;
        if( typeof message !== "string"){
            parsedData = JSON.parse(message.toString())
        }else{
            parsedData = JSON.parse(message)
        }

        // Joining Room
        if( parsedData.type == "Join_room"){  // { type: "Join", roomId: 1 }
            const user = users.find(x => x.ws === ws)

            if(!user){
                ws.send("Error while joining the room")
                return
            }

            const room = await prismaClient.room.findFirst({
                where: {
                    id: parsedData.roomId
                }
            })

            if(room){
                user.rooms.push(parsedData.roomId) 
            } else {
                ws.send("room does not exist")
            } 
        }

        //Leaving Room
        if(parsedData.type === "Leave_room"){ // { type: "Leave_Room" , roomId: 2}
            const user = users.find( x => x.ws === ws)

            if(!user){
                ws.send("User does not exist")
                ws.close()
                return
            }

            user.rooms = user.rooms.filter(x=> x !== parsedData.roomId)
            console.log(user.rooms);
        } 
        
        //Chat Message 
        if(parsedData.type === "Chat"){ // { type: "Chat" , messga: "" , roomId:2}
            const roomId = parsedData.roomId
            const message = parsedData.message

            await prismaClient.chat.create({
                data:{
                    roomId: Number(roomId),
                    message: message,
                    userId: userId
                }
            })

            users.forEach(user => {
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type: "Chat",
                        message: message,
                        roomId: roomId
                    }))
                }
            })
        }
    }) 
})