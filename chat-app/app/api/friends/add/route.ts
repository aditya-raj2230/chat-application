import { fetchRedis } from "@/app/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { addfriendValidator } from "@/lib/validations/add-friend"
import { getServerSession } from "next-auth"
import {z} from 'zod'

export async function POST(req:Request) {
    try{
        const body = await req.json()

        const {email:emailToAdd}=addfriendValidator.parse(body.email)

       const idToAdd= await fetchRedis('get',`user:email:${emailToAdd}` )as string



        if (!idToAdd){
            return new Response('this person does not exist: ',{status:400})
        }
        const session = await getServerSession(authOptions)

        if(idToAdd===session?.user.id){
            return new Response('you cannot add your self as frnd ', {status:400})
        }

        

       
        if(!session){
            return new Response('unauthorised ', {status:401})
        }

        // to check if user is already added 

        const isAlreadyAdded = (await fetchRedis('sismember',`user:${idToAdd}:incoming_friend_request`,session.user.id))as 0|1
        
        if(isAlreadyAdded){
            return new Response('already addded user ', {status:400})
        }

        const isAlreadyFriends = (await fetchRedis('sismember',`user:${session.user.id}:friends`,idToAdd))as 0|1

        if(isAlreadyFriends){
            return new Response('already friends', {status:400})
        }

        // valid request 

        db.sadd(`user:${idToAdd}:incoming_friend_request`, session.user.id)

        return new Response('OK')
    }catch(error){
        if(error instanceof z.ZodError ){
            return new Response('Invalid request payload',{status:400})

        }
        return new Response('invalid request',{status:422})
    }
    
}