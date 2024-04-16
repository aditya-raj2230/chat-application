'use client'
import { Check, UserPlus, X } from 'lucide-react'
import React, { FC, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { pusherClient } from '@/lib/pusher'
import { toPushserKey } from '@/lib/utils'

interface FriendRequestsProps {
  incomingFriendRequests:IncomingFriendRequests[]
  sessionId:string
}


const FriendRequests :FC<FriendRequestsProps>= ({incomingFriendRequests,sessionId}) => {
  const router = useRouter()
  const [friendRequests,setFriendRequests]=useState<IncomingFriendRequests[]>(incomingFriendRequests)


  useEffect(()=>{
    pusherClient.subscribe(toPushserKey(
      `user:${sessionId}:incoming_friend_request`
    ))
    const friendRequestHandler=({senderId,senderEmail}:IncomingFriendRequests)=>{
      setFriendRequests((prev)=>[...prev,{senderId,senderEmail}])
    }

    pusherClient.bind('incoming_friend_request',friendRequestHandler)

    return()=>{
      pusherClient.unsubscribe(toPushserKey(
        `user:${sessionId}:incoming_friend_request`
      ))
      pusherClient.unbind('incoming_friend_request',friendRequestHandler)
    }

  },[])

  
const acceptFriend=async (senderId:string)=>{
  await axios.post('/api/friends/accept',{id:senderId})

  setFriendRequests((prev)=>prev.filter((request)=>request.senderId!== senderId))
  router.refresh()
}
const denyFriend=async (senderId:string)=>{
  await axios.post('/api/friends/deny',{id:senderId})

  setFriendRequests((prev)=>prev.filter((request)=>request.senderId!== senderId))
  router.refresh()
}


  
  return <>
  {
    friendRequests.length === 0?( <p className='text-sm text-zinc-500'>Nothing to say here...</p>):(
      
      friendRequests.map((request)=>(
        
        <div key={request.senderId} className='flex gap-4 items-center'><UserPlus className='text-black'/>
      <p className='font-medium text-lg'>{request.senderEmail}</p>
      <button onClick={()=>acceptFriend(request.senderId)} className='w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md'> <Check className='font-semibold text-white w-3/4 h-3/4'/></button>

      <button  onClick={()=>denyFriend(request.senderId)} className='w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md'> <X className='font-semibold text-white w-3/4 h-3/4'/></button>
      
      </div>
      ))
    
    )
  }
  </>
}

export default FriendRequests