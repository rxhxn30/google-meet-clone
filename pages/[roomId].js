import { useEffect } from "react"
import { useSocket } from "@/context/socket"
import usePeer from "@/hooks/usePeer"
import useMediaStream from "@/hooks/useMediaStream"
const Room = () => {
    const socket = useSocket()
    const {peer, myId} = usePeer();
    const {stream} = useMediaStream()

    return(
        <div>
            Test
        </div>
    )
}

export default Room;