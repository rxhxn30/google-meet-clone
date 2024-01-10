import { useEffect } from "react"
import { useSocket } from "@/context/socket"
import usePeer from "@/hooks/usePeer"
import useMediaStream from "@/hooks/useMediaStream"
import usePlayer from "@/hooks/usePlayer"
import Player from "@/component/Player"
import Bottom from "@/component/Bottom"
import styles from '@/styles/room.module.css'
import { useRouter } from "next/router"
import { cloneDeep } from "lodash"
const Room = () => {
    const socket = useSocket()
    const {roomId} = useRouter().query
    const {peer, myId} = usePeer();
    const {stream} = useMediaStream()
    const {players,setPlayers,playerHighlighted,nonHighlightedPlayers,toggleAudio,toggleVideo,leaveRoom} = usePlayer(myId,roomId, peer)
    useEffect(() => {
        if(!socket || !peer || !stream) return;
        const handleUserConnected = (newUser) => {
            console.log(`user connected to room with userId ${newUser}`)

            const call = peer.call(newUser,stream)
            call.on('stream',(incomingStream) => {
                console.log(`incoming stream from ${newUser}`)
                setPlayers((prev) => ({
                    ...prev,
                    [newUser] : {
                        url: incomingStream,
                        muted: false,
                        playing: true
                    }
                }))
            })
        }
        socket.on('user-connected',handleUserConnected)

        return() => {
            socket.off('user-connected',handleUserConnected)
        }
    },[peer,socket,stream])    

    useEffect(() => {
        if(!socket) return;
        const handleToggleAudio =(userId) => {
            console.log(`user with id ${userId} toggled audio`)
            setPlayers((prev) => {
                const copy = cloneDeep(prev);
                copy[userId].muted = !copy[userId].muted
                return {...copy} 
            })
        }   

        const handleToggleVideo =(userId) => {
            console.log(`user with id ${userId} toggled video`)
            setPlayers((prev) => {
                const copy = cloneDeep(prev);
                copy[userId].playing = !copy[userId].playing
                return {...copy} 
            })
        }   

        socket.on('user-toggle-audio',handleToggleAudio)
        socket.on('user-toggle-video',handleToggleVideo)
        return () => {
            socket.off('user-toggle-audio',handleToggleAudio)
            socket.off('user-toggle-video',handleToggleVideo)
        }
    },[setPlayers, socket])

    useEffect(() => {
        if(!peer || !stream) return
        peer.on('call',(call) => {
            const {peer: callerId} = call;
            call.answer(stream)
            call.on('stream',(incomingStream) => {
                console.log(`incoming stream from ${callerId}`)
                setPlayers((prev) => ({
                    ...prev,
                    [callerId] : {
                        url: incomingStream,
                        muted: false,
                        playing: true
                    }
                }))
            }, [peer,setPlayers,stream])
        })
    },[peer, stream])

    useEffect(() => {
        if(!stream || !myId) return;
        console.log(`setting my stream ${myId}`)
        setPlayers((prev) => ({
            ...prev,
            [myId] : {
                url: stream,
                muted: false,
                playing: true
            }
        }))
        
    },[myId,setPlayers,stream])

    return(
        <>
        <div className={styles.activePlayerContainer}>
            {playerHighlighted && (<Player url={playerHighlighted.url} muted={playerHighlighted.muted} playing={playerHighlighted.playing} isActive />)}
        </div>
        <div className={styles.inactivePlayerContainer}>
            {Object.keys(nonHighlightedPlayers).map((playerId) => {
                const {url,muted,playing} = nonHighlightedPlayers[playerId]
                return <Player key={playerId} url={url} muted={muted} playing={playing} isActive={false} />
            })}
        </div>
        <Bottom muted={playerHighlighted?.muted} playing={playerHighlighted?.playing} toggleAudio={toggleAudio} toggleVideo={toggleVideo} leaveRoom={leaveRoom} />
        </>
    )
}

export default Room;