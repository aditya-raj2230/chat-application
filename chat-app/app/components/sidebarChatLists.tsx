'use client'
import { chatHrefConstructor } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import {FC, useEffect, useState} from 'react'

interface SidebarChatListsProps {
    friends:User[]
    sessionId:string
}

const SidebarChatLists:FC<SidebarChatListsProps> = ({friends,sessionId}) => {

    const router = useRouter()
    const pathname= usePathname()
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