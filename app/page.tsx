"use client"
import { useState, useEffect } from "react"
import { PhoneAuth } from "@/components/phone-auth"
import { ContactSyncInterface } from "@/components/contact-sync-interface"
import { MutualContactChat } from "@/components/mutual-contact-chat"
import type { ContactInfo } from "@/lib/contact-verification-service"

export default function HiChatApp() {
  const [authStep, setAuthStep] = useState<"auth" | "sync" | "chat">("auth")
  const [userPhone, setUserPhone] = useState("")
  const [userName, setUserName] = useState("")
  const [contacts, setContacts] = useState<ContactInfo[]>([])

  useEffect(() => {
    // Check if user is already authenticated
    const savedAuth = localStorage.getItem("hi-chat-auth")
    const savedPhone = localStorage.getItem("hi-chat-phone")
    const savedName = localStorage.getItem("hi-chat-name")
    const savedContacts = localStorage.getItem("hi-chat-contacts")

    if (savedAuth && savedPhone && savedName) {
      setUserPhone(savedPhone)
      setUserName(savedName)

      if (savedContacts) {
        const parsedContacts = JSON.parse(savedContacts)
        setContacts(parsedContacts)
        setAuthStep("chat")
      } else {
        setAuthStep("sync")
      }
    }
  }, [])

  const handleAuthSuccess = (phone: string, name: string) => {
    setUserPhone(phone)
    setUserName(name)
    localStorage.setItem("hi-chat-auth", "true")
    localStorage.setItem("hi-chat-phone", phone)
    localStorage.setItem("hi-chat-name", name)
    setAuthStep("sync")
  }

  const handleSyncComplete = (syncedContacts: ContactInfo[]) => {
    setContacts(syncedContacts)
    localStorage.setItem("hi-chat-contacts", JSON.stringify(syncedContacts))
    setAuthStep("chat")
  }

  const handleResyncContacts = () => {
    localStorage.removeItem("hi-chat-contacts")
    setAuthStep("sync")
  }

  const handleLogout = () => {
    setAuthStep("auth")
    setUserPhone("")
    setUserName("")
    setContacts([])
    localStorage.removeItem("hi-chat-auth")
    localStorage.removeItem("hi-chat-phone")
    localStorage.removeItem("hi-chat-name")
    localStorage.removeItem("hi-chat-contacts")
  }

  if (authStep === "auth") {
    return <PhoneAuth onAuthSuccess={handleAuthSuccess} />
  }

  if (authStep === "sync") {
    return <ContactSyncInterface userPhone={userPhone} userName={userName} onSyncComplete={handleSyncComplete} />
  }

  return (
    <MutualContactChat
      userPhone={userPhone}
      userName={userName}
      contacts={contacts}
      onLogout={handleLogout}
      onResyncContacts={handleResyncContacts}
    />
  )
}
