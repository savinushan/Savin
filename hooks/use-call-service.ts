"use client"

import { useState, useEffect, useRef } from "react"
import { WebRTCService } from "@/lib/webrtc-service"
import { SignalingService, type SignalingMessage } from "@/lib/signaling-service"

type CallState = "idle" | "connecting" | "connected" | "ended"

interface UseCallServiceProps {
  userId: string
  userName: string
}

export function useCallService({ userId, userName }: UseCallServiceProps) {
  const [callState, setCallState] = useState<CallState>("idle")
  const [currentCall, setCurrentCall] = useState<{
    contactId: string
    contactName: string
    callType: "audio" | "video"
    isIncoming: boolean
  } | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)

  const webRTCServiceRef = useRef<WebRTCService | null>(null)
  const signalingServiceRef = useRef<SignalingService | null>(null)

  // Initialize services
  useEffect(() => {
    webRTCServiceRef.current = new WebRTCService()
    signalingServiceRef.current = new SignalingService()

    // Set up WebRTC callbacks
    if (webRTCServiceRef.current) {
      webRTCServiceRef.current.setOnRemoteStream((stream) => {
        setRemoteStream(stream)
      })

      webRTCServiceRef.current.setOnConnectionStateChange((state) => {
        if (state === "connected") {
          setCallState("connected")
        } else if (state === "disconnected" || state === "failed" || state === "closed") {
          endCall()
        }
      })
    }

    // Set up signaling callbacks
    if (signalingServiceRef.current) {
      signalingServiceRef.current.onMessage(handleSignalingMessage)
      signalingServiceRef.current.connect(userId)
    }

    return () => {
      if (webRTCServiceRef.current) {
        webRTCServiceRef.current.endCall()
      }
      if (signalingServiceRef.current) {
        signalingServiceRef.current.disconnect()
      }
    }
  }, [userId])

  // Handle incoming signaling messages
  const handleSignalingMessage = (message: SignalingMessage) => {
    if (!webRTCServiceRef.current || !signalingServiceRef.current) return

    switch (message.type) {
      case "call-request":
        // Handle incoming call
        setCurrentCall({
          contactId: message.sender,
          contactName: message.payload.userName,
          callType: message.payload.callType,
          isIncoming: true,
        })
        break

      case "call-accepted":
        // Start WebRTC connection
        startWebRTCConnection(message.sender, currentCall?.callType === "video")
        break

      case "call-rejected":
        // Handle call rejection
        endCall()
        break

      case "call-ended":
        // Handle remote call end
        endCall()
        break

      case "offer":
        // Handle WebRTC offer
        webRTCServiceRef.current.handleOffer(message.payload).then((answer) => {
          signalingServiceRef.current?.sendMessage({
            type: "answer",
            sender: userId,
            recipient: message.sender,
            payload: answer,
          })
        })
        break

      case "answer":
        // Handle WebRTC answer
        webRTCServiceRef.current.handleAnswer(message.payload)
        break

      case "ice-candidate":
        // Handle ICE candidate
        webRTCServiceRef.current.addIceCandidate(message.payload)
        break
    }
  }

  // Start a call
  const startCall = async (contactId: string, contactName: string, callType: "audio" | "video") => {
    if (!signalingServiceRef.current) return

    setCurrentCall({
      contactId,
      contactName,
      callType,
      isIncoming: false,
    })

    setCallState("connecting")

    // Send call request via signaling
    signalingServiceRef.current.sendMessage({
      type: "call-request",
      sender: userId,
      recipient: contactId,
      payload: {
        userName,
        callType,
      },
    })
  }

  // Start WebRTC connection
  const startWebRTCConnection = async (recipientId: string, videoEnabled: boolean) => {
    if (!webRTCServiceRef.current || !signalingServiceRef.current) return

    try {
      // Get user media
      const stream = await webRTCServiceRef.current.getUserMedia(videoEnabled)
      setLocalStream(stream)
      setIsVideoEnabled(videoEnabled)

      // Create and send offer
      const offer = await webRTCServiceRef.current.createOffer()
      signalingServiceRef.current.sendMessage({
        type: "offer",
        sender: userId,
        recipient: recipientId,
        payload: offer,
      })
    } catch (error) {
      console.error("Error starting WebRTC connection:", error)
      endCall()
    }
  }

  // Accept an incoming call
  const acceptCall = async () => {
    if (!currentCall || !signalingServiceRef.current) return

    setCallState("connecting")

    signalingServiceRef.current.sendMessage({
      type: "call-accepted",
      sender: userId,
      recipient: currentCall.contactId,
      payload: {
        userName,
      },
    })
  }

  // Reject an incoming call
  const rejectCall = () => {
    if (!currentCall || !signalingServiceRef.current) return

    signalingServiceRef.current.sendMessage({
      type: "call-rejected",
      sender: userId,
      recipient: currentCall.contactId,
      payload: {},
    })

    setCurrentCall(null)
    setCallState("idle")
  }

  // End an ongoing call
  const endCall = () => {
    if (!currentCall || !signalingServiceRef.current || !webRTCServiceRef.current) return

    signalingServiceRef.current.sendMessage({
      type: "call-ended",
      sender: userId,
      recipient: currentCall.contactId,
      payload: {},
    })

    webRTCServiceRef.current.endCall()

    setLocalStream(null)
    setRemoteStream(null)
    setCurrentCall(null)
    setCallState("ended")

    // Reset to idle after a short delay
    setTimeout(() => {
      setCallState("idle")
    }, 500)
  }

  // Toggle mute
  const toggleMute = () => {
    if (!webRTCServiceRef.current) return

    const newMuteState = !isMuted
    webRTCServiceRef.current.toggleAudio(!newMuteState)
    setIsMuted(newMuteState)
  }

  // Toggle video
  const toggleVideo = () => {
    if (!webRTCServiceRef.current || currentCall?.callType !== "video") return

    const newVideoState = !isVideoEnabled
    webRTCServiceRef.current.toggleVideo(newVideoState)
    setIsVideoEnabled(newVideoState)
  }

  return {
    callState,
    currentCall,
    localStream,
    remoteStream,
    isMuted,
    isVideoEnabled,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  }
}
