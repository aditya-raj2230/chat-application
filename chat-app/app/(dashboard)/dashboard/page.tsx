import { getServerSession } from "next-auth";
import Button from "../../components/ui/Button";
import {FC} from 'react'
import { authOptions } from "@/lib/auth";


 
const page = async ({}) => {
    const session = await getServerSession(authOptions)
    // uncomment the session thing once the coding part is done and wanna run with phone wifi
    return <pre>hello</pre>
}
 
export default page;