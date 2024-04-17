import { fetchRedis } from '@/app/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { pusherServer } from '@/lib/pusher'
import { toPushserKey } from '@/lib/utils'
import { getServerSession } from 'next-auth'
import {z} from 'zod'

export async function POST (req:Request){
    try{
        const body = await req.json()

        const {id:idToadd}=z.object({id:z.string()}).parse(body)

        const session = await getServerSession(authOptions)
        if(!session) {
            return new Response ('unauthorised',{status:401})
        }
        // varify both users are already frnds 

        const isAlreadyFriends = await fetchRedis('sismember',`user:${session.user.id}:friends`,idToadd)

        if(isAlreadyFriends){
            return new Response('already frnds',{status:402})
        }

        //notify added use

        pusherServer.trigger(toPushserKey(`user:${idToadd}:friends`),'new_friend',"")

        const hasFriendRequest = await fetchRedis('sismember',`user:${session.user.id}incoming_friend_request`,idToadd)

        if (!hasFriendRequest){
            return new Response('no friend request', {status:400})
        }

        await db.sadd(`user:${session.user.id}:friends`,idToadd)
        await db.sadd(`user:${idToadd}:friends`,session.user.id)
        await db.srem(`user:${session.user.id}:incoming_friend_request`,idToadd)

        console.log()
        return new Response("ok")
    }catch(error){
        if(error instanceof z.ZodError){
            return new Response ('invalid reques payload',{status:422})
        }
        return new Response('invalid request',{status:400})

    }
}