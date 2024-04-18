'use client'


import { pusherClient } from '@/lib/pusher'
import { toPushserKey } from '@/lib/utils'
import { User } from 'lucide-react'
import Link from 'next/link'
import {FC, useEffect, useState}from 'react'

interface FriendRequestSidebarOptionProps {
    sessionId:string
    initialUnseenRequestscount:number
}

const FriendRequestSidebarOption :FC<FriendRequestSidebarOptionProps>= ({initialUnseenRequestscount,sessionId}) => {
    const [unseenRequestsCount,setUnseenRequestsCount]=useState<number>(initialUnseenRequestscount)


    useEffect(()=>{
      pusherClient.subscribe(
        toPushserKey(
        `user:${sessionId}:incoming_friend_request`
      ))
      pusherClient.subscribe(toPushserKey(`user:${sessionId}:friends`))
      const friendRequestHandler=({senderId,senderEmail}:IncomingFriendRequests)=>{
       setUnseenRequestsCount((prev)=>prev+1)
      }
  
      const addedFriendHandler=()=>{
        setUnseenRequestsCount((prev)=>prev-1)
      }
      pusherClient.bind('incoming_friend_request',friendRequestHandler)
      pusherClient.bind('new_friend',addedFriendHandler)
  
      return()=>{
        pusherClient.unsubscribe(toPushserKey(
          `user:${sessionId}:incoming_friend_request`
        ))
        pusherClient.unsubscribe(toPushserKey(`user:${sessionId}:friends`))
        pusherClient.unbind('incoming_friend_request',friendRequestHandler)
        pusherClient.unbind('new_friend',addedFriendHandler)

      }
  
    },[sessionId])
  

  return <Link href='/dashboard/requests' className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 leading-6 font-semibold'><div className='text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 items-center rounded-lg border text-[0.625rem] font-medium bg-white justify-center'>
    <User className='h-4 w-4' />
    
    </div>
    <p className='truncate'>Friend requests</p>
    {unseenRequestsCount>0?(<div className='rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-indigo-600'>{unseenRequestsCount}</div>):null}
    </Link>
}

export default FriendRequestSidebarOption