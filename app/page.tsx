"use client"
import { useState, useEffect, useRef } from "react"
import type { Socket } from "socket.io-client"
import { PhoneAuth } from "@/components/phone-auth"
import { ChatInterface } from "@/components/chat-interface"

interface Message {
  id: string
  username: string
  message: string
  timestamp: Date
  color: string
}

interface User {
  id: string
  username: string
  color: string
}

const colors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-yellow-500",
  "bg-indigo-500",
  "bg-red-500",
  "bg-teal-500",
]

export default function HiChatApp() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [username, setUsername] = useState("")
  const [currentMessage, setCurrentMessage] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [userColor, setUserColor] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userPhone, setUserPhone] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if user is already authenticated
    const savedAuth = localStorage.getItem("hi-chat-auth")
    const savedPhone = localStorage.getItem("hi-chat-phone")
    const savedName = localStorage.getItem("hi-chat-name")

    if (savedAuth && savedPhone && savedName) {
      setIsAuthenticated(true)
      setUserPhone(savedPhone)
      setUsername(savedName)
    }
  }, [])

  const handleAuthSuccess = (phone: string, name: string) => {
    setIsAuthenticated(true)
    setUserPhone(phone)
    setUsername(name)
    localStorage.setItem("hi-chat-auth", "true")
    localStorage.setItem("hi-chat-phone", phone)
    localStorage.setItem("hi-chat-name", name)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserPhone("")
    setUsername("")
    localStorage.removeItem("hi-chat-auth")
    localStorage.removeItem("hi-chat-phone")
    localStorage.removeItem("hi-chat-name")
  }

  if (!isAuthenticated) {
    return <PhoneAuth onAuthSuccess={handleAuthSuccess} />
  }

  return <ChatInterface userPhone={userPhone} userName={username} onLogout={handleLogout} />
}
