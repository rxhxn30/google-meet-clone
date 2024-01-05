import {v4 as uuidv4} from 'uuid'
import { useRouter } from "next/navigation"

import styles from '@/styles/home.module.css'

export default function Home() {
  const router = useRouter()

  const createAndJoin = () => {
    const roomId = uuidv4()
    router.push(`/${roomId}`)
  }
  return (
    <div>
      <h1>Google Meet Clone</h1>
      <div>
        <input />
        <button>Join Room</button>
      </div>
      <span>--------------- OR ---------------</span>
      <button>Create Room</button>
    </div> 
  )
}
