'use client'
import { pusherClient } from '@/lib/pusher'
import { chatHrefConstructor, toPushserKey } from '@/lib/utils'
import { Message } from '@/lib/validations/message'
import { usePathname, useRouter } from 'next/navigation'
import {FC, useEffect, useState} from 'react'
import toast from 'react-hot-toast'
import { any } from 'zod'
import UnseenChatToast from './UnseenChatToast'
import path from 'path'

interface SidebarChatListsProps {
    friends:User[]
    sessionId:string
}

interface extendedMessage extends Message{
    senderImg: string,
    senderName: string
}

const SidebarChatLists:FC<SidebarChatListsProps> = ({friends,sessionId}) => {

    
    const router = useRouter()
    const pathname= usePathname()
    const [activeChats, setActiveChats]= useState<User[]>(friends)

    useEffect(()=>{
        pusherClient.subscribe(toPushserKey(`user:${sessionId}:chats`))

        pusherClient.subscribe(toPushserKey(`user:${sessionId}:friends`))

        const newFriendHandler=(newfriend:User)=>{
            setActiveChats((prev)=>[...prev,newfriend])
            router.refresh()
        }

        const chatHandler=(message:extendedMessage)=>{
            // console.log('new chat message',message)
            const shouldNotify= pathname !==`/dashboard/chat/${chatHrefConstructor(sessionId,message.senderId)}`

            if(!shouldNotify) return

            // should notify

            toast.custom((t)=>(
                <UnseenChatToast t={t} sessionId={sessionId} senderId={message.senderId} senderImg={message.senderImg} senderMessage={message.text} senderName={message.senderName}  />    
                  ))

            setUnseenMessages((prev)=>[...prev,message])
        }

        pusherClient.bind('new_message',chatHandler)
        pusherClient.bind('new_friend',newFriendHandler)


        return()=>{
            pusherClient.unsubscribe(toPushserKey(`user:${sessionId}:chats`))

        pusherClient.unsubscribe(toPushserKey(`user:${sessionId}:friends`))
        pusherClient.unbind('new_message',chatHandler)
        pusherClient.unbind('new_friend',newFriendHandler)
        }
    },[pathname,sessionId,router])

    const [ unseenMessages,setUnseenMessages]= useState<Message[]>([])

    useEffect(()=>{
        if(pathname?.includes('chat')){
            setUnseenMessages((prev)=>{
                return prev.filter((msg)=>!pathname.includes(msg.senderId))
            })
            
        }
    },[pathname]) 

  return <ul role='list' className='max-h-[25rem] overflow-y-auto -mx-2 space-y-1 '>
{friends.sort().map((friend)=>{

    const unseenMessagesCount = unseenMessages.filter((unseenmsg)=>{
        return unseenmsg.senderId === friend.id
    }).length


    return <li key={friend.id}>
        <a className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gapx3 rounded-md p-2 text-sm leading-6 ' href={`/dashboard/chat/${chatHrefConstructor(
            sessionId,
            friend.id
        )}`}>{friend.name}
        {unseenMessagesCount>0 ?(<div className='rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-indigo-600'>{unseenMessagesCount}</div>):null}</a>
    </li>
 })}
  </ul>
}

export default SidebarChatLists