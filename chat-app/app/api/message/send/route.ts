import { fetchRedis } from "@/app/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { timeStamp } from "console"
import { getServerSession } from "next-auth"
import {nanoid} from'nanoid'
import { Message, messageValidator } from "@/lib/validations/message"
import { pusherClient, pusherServer } from "@/lib/pusher"
import { toPushserKey } from "@/lib/utils"

export async function POST(req:Request) {
    try {
        const {text,chatId}:{text:string,chatId:string}= await req.json()
        const session = await getServerSession(authOptions)

        if(!session) return new Response ('unauthorised' ,{status:401})

            const [userId1, userId2]=chatId.split('--')

            if(session.user.id !== userId1 && session.user.id !==userId2){
                return new Response('unauthorised',{status:401})
            }

            const friendId = session?.user.id===userId1?userId2:userId1

            const friendList = await fetchRedis('smembers',`user:${session?.user.id}:friends`)as string[]
            const isFriend = friendList.includes(friendId)

            if(!isFriend){
                return new Response ('unauthorised' ,{status:401})
            }

            const rawSender = await fetchRedis('get',`user:${session?.user.id}`)as string
            const sender = JSON.parse(rawSender) as User

            const timeStamp= Date.now() 
            const messageData :Message={
                id: nanoid(),
                senderId:session.user.id,
                text,
                timestamp:timeStamp,
                }

            const message= messageValidator.parse(messageData)

            // notify all connectd chat room

            pusherServer.trigger(toPushserKey(`chat:${chatId}`),'incoming-message',message)

            // all valid send message
            await db.zadd(`chat:${chatId}:messages`,{
                score:timeStamp,
                member:JSON.stringify(message)

            })

            return new Response('ok')

            
    } catch (error) {
        if(error instanceof Error){
            return new Response(error.message,{status:500})
        }
        return new Response("internal server error",{status:500})
    }
}