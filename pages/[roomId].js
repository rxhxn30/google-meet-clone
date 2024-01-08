import { useEffect } from "react"
import { useSocket } from "@/context/socket"
import usePeer from "@/hooks/usePeer"
import useMediaStream from "@/hooks/useMediaStream"
import usePlayer from "@/hooks/usePlayer"
import Player from "@/component/Player"


const Room = () => {
    const socket = useSocket()
    const {peer, myId} = usePeer();
    const {stream} = useMediaStream()
    const [players,setPlayers] = usePlayer()
    useEffect(() => {
        if(!socket || !peer || !stream) return;
        const handleUserConnected = (newUser) => {
            console.log(`user connected to room with userId ${newUser}`)

            const call = peer.call(newUser,stream)
            call.on('stream',(incomingStream) => {
                console.log(`incoming stream from ${newUser}`)
            })
        }
        socket.on('user-connected',handleUserConnected)

        return() => {
            socket.off('user-connected',handleUserConnected)
        }
    },[peer,socket,stream])    

    useEffect(() => {
        if(!peer || !stream) return
        peer.on('call',(call) => {
            const {peer: callerId} = call;
            call.answer(stream)
            call.on('stream',(incomingStream) => {
                console.log(`incoming stream from ${callerId}`)
            })
        })
    },[peer, stream])

    return(
        <div>
            <Player url={stream} muted playing playerId={myId}/>
        </div>
    )
}

export default Room;