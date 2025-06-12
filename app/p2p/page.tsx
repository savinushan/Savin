"use client"

import { useState, useEffect } from "react"
import { PhoneAuth } from "@/components/phone-auth"
import { P2PChatInterface } from "@/components/p2p-chat-interface"

export default function P2PPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userPhone, setUserPhone] = useState("")
  const [userName, setUserName] = useState("")

  useEffect(() => {
    // Check if user is already authenticated
    const savedAuth = localStorage.getItem("hi-chat-auth")
    const savedPhone = localStorage.getItem("hi-chat-phone")
    const savedName = localStorage.getItem("hi-chat-name")

    if (savedAuth && savedPhone && savedName) {
      setIsAuthenticated(true)
      setUserPhone(savedPhone)
      setUserName(savedName)
    }
  }, [])

  const handleAuthSuccess = (phone: string, name: string) => {
    setIsAuthenticated(true)
    setUserPhone(phone)
    setUserName(name)
    localStorage.setItem("hi-chat-auth", "true")
    localStorage.setItem("hi-chat-phone", phone)
    localStorage.setItem("hi-chat-name", name)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserPhone("")
    setUserName("")
    localStorage.removeItem("hi-chat-auth")
    localStorage.removeItem("hi-chat-phone")
    localStorage.removeItem("hi-chat-name")
  }

  if (!isAuthenticated) {
    return <PhoneAuth onAuthSuccess={handleAuthSuccess} />
  }

  return <P2PChatInterface userId={userPhone} userName={userName} userPhone={userPhone} onLogout={handleLogout} />
}
