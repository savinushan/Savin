"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mic, MicOff, Video, VideoOff, PhoneOff, Phone, Volume2, Volume1 } from "lucide-react"

interface CallInterfaceProps {
  contactName: string
  contactAvatar: string
  callType: "audio" | "video"
  onEndCall: () => void
  isIncoming?: boolean
  onAccept?: () => void
  onReject?: () => void
}

export function CallInterface({
  contactName,
  contactAvatar,
  callType,
  onEndCall,
  isIncoming = false,
  onAccept,
  onReject,
}: CallInterfaceProps) {
  const [callStatus, setCallStatus] = useState<"connecting" | "connected" | "ended">(
    isIncoming ? "connecting" : "connecting",
  )
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === "video")
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Simulate call connection
  useEffect(() => {
    if (!isIncoming) {
      const timer = setTimeout(() => {
        setCallStatus("connected")
        startCallTimer()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isIncoming])

  // Handle call timer
  const startCallTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)
  }

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle call end
  const handleEndCall = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setCallStatus("ended")
    setTimeout(() => {
      onEndCall()
    }, 500)
  }

  // Simulate video stream (in a real app, this would use WebRTC)
  useEffect(() => {
    if (callType === "video" && callStatus === "connected") {
      // In a real implementation, this would be WebRTC code
      // This is just a simulation for the UI
      const getLocalStream = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream
          }
          // In a real app, you would connect this stream to the peer
        } catch (err) {
          console.error("Error accessing media devices:", err)
        }
      }

      if (isVideoEnabled) {
        getLocalStream()
      }
    }

    return () => {
      // Clean up video streams
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [callType, callStatus, isVideoEnabled])

  // Handle mute toggle
  const toggleMute = () => {
    setIsMuted(!isMuted)
    // In a real app, you would mute the audio track
  }

  // Handle video toggle
  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled)
    // In a real app, you would enable/disable the video track
  }

  // Handle speaker toggle
  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn)
    // In a real app, you would switch audio output
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900/95 via-gray-900 to-blue-900/95 flex flex-col items-center justify-between p-6">
      {/* Liquid glass background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Call status and duration */}
      <div className="relative z-10 text-center mt-12">
        <p className="text-blue-200 font-medium mb-2">
          {isIncoming && callStatus === "connecting"
            ? "Incoming call..."
            : callStatus === "connecting"
              ? "Connecting..."
              : callStatus === "connected"
                ? "Connected"
                : "Call ended"}
        </p>
        {callStatus === "connected" && <p className="text-white/70 text-sm">{formatDuration(callDuration)}</p>}
      </div>

      {/* Contact info */}
      <div className="relative z-10 flex flex-col items-center">
        {callType === "video" && callStatus === "connected" ? (
          <div className="relative w-full max-w-lg aspect-[3/4] rounded-3xl overflow-hidden bg-gray-800 shadow-2xl border border-white/10">
            {/* Remote video (main) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              poster="/placeholder.svg?height=600&width=400"
            />

            {/* Local video (picture-in-picture) */}
            <div className="absolute bottom-4 right-4 w-32 aspect-[3/4] rounded-2xl overflow-hidden bg-gray-900 border border-white/20 shadow-xl">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isVideoEnabled ? "" : "hidden"}`}
              />
              {!isVideoEnabled && (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <VideoOff className="h-6 w-6 text-white/50" />
                </div>
              )}
            </div>

            {/* Contact name overlay */}
            <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-md rounded-full px-4 py-2">
              <p className="text-white font-medium">{contactName}</p>
            </div>
          </div>
        ) : (
          <>
            <Avatar className="h-40 w-40 border-4 border-white/10 shadow-2xl mb-6">
              <AvatarFallback className="bg-gradient-to-br from-blue-500/30 to-purple-600/30 text-white text-5xl font-bold backdrop-blur-sm">
                {contactAvatar || getInitials(contactName)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-white text-3xl font-bold mb-2">{contactName}</h2>
            <p className="text-blue-200">
              {callType === "audio" ? "Audio call" : "Video call"}
              {callStatus === "connected" && ` • ${formatDuration(callDuration)}`}
            </p>
          </>
        )}
      </div>

      {/* Call controls */}
      <div className="relative z-10 mb-12">
        {isIncoming && callStatus === "connecting" ? (
          <div className="flex items-center gap-8">
            <Button
              onClick={() => onReject && onReject()}
              className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/50"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
            <Button
              onClick={() => {
                onAccept && onAccept()
                setCallStatus("connected")
                startCallTimer()
              }}
              className="h-16 w-16 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/50"
            >
              <Phone className="h-6 w-6" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <Button
              onClick={toggleMute}
              variant="outline"
              className={`h-14 w-14 rounded-full border-white/20 ${
                isMuted ? "bg-gray-700/80 text-white" : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              }`}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>

            {callType === "video" && (
              <Button
                onClick={toggleVideo}
                variant="outline"
                className={`h-14 w-14 rounded-full border-white/20 ${
                  !isVideoEnabled
                    ? "bg-gray-700/80 text-white"
                    : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                }`}
              >
                {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </Button>
            )}

            <Button
              onClick={handleEndCall}
              className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/50"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>

            <Button
              onClick={toggleSpeaker}
              variant="outline"
              className={`h-14 w-14 rounded-full border-white/20 ${
                isSpeakerOn ? "bg-gray-700/80 text-white" : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              }`}
            >
              {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <Volume1 className="h-6 w-6" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
