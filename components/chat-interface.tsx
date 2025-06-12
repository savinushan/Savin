"use client"

import type React from "react"
import { CallInterface } from "@/components/call-interface"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  MessageCircle,
  Send,
  Phone,
  Video,
  Search,
  ArrowLeft,
  Check,
  CheckCheck,
  Settings,
  Users,
  Plus,
  Circle,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
  Eye,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface ChatInterfaceProps {
  userPhone: string
  userName: string
  onLogout: () => void
}

interface Contact {
  id: string
  name: string
  phone: string
  lastMessage: string
  timestamp: string
  unread: number
  online: boolean
  isFromContacts?: boolean
}

interface Message {
  id: string
  senderId: string
  text: string
  timestamp: Date
  status: "sent" | "delivered" | "read"
}

interface StatusUpdate {
  id: string
  name: string
  timestamp: string
  viewed: boolean
  isOwn?: boolean
  avatar: string
}

interface CallRecord {
  id: string
  name: string
  phone: string
  type: "incoming" | "outgoing" | "missed"
  timestamp: string
  duration?: string
  avatar: string
}

// Simulated contacts from phone book
const phoneContacts: Contact[] = [
  {
    id: "1",
    name: "Kasun Perera",
    phone: "+94 71 234 5678",
    lastMessage: "Kohomada machan?",
    timestamp: "2 min ago",
    unread: 2,
    online: true,
    isFromContacts: true,
  },
  {
    id: "2",
    name: "Nimali Silva",
    phone: "+94 77 987 6543",
    lastMessage: "Office eka giya da?",
    timestamp: "1 hour ago",
    unread: 0,
    online: true,
    isFromContacts: true,
  },
  {
    id: "3",
    name: "Chaminda Fernando",
    phone: "+94 70 555 1234",
    lastMessage: "Match eka balanna one",
    timestamp: "Yesterday",
    unread: 1,
    online: false,
    isFromContacts: true,
  },
  {
    id: "4",
    name: "Sanduni Rajapaksa",
    phone: "+94 76 888 9999",
    lastMessage: "Thanks for the help!",
    timestamp: "Yesterday",
    unread: 0,
    online: true,
    isFromContacts: true,
  },
  {
    id: "5",
    name: "Pradeep Wickramasinghe",
    phone: "+94 75 111 2222",
    lastMessage: "See you tomorrow!",
    timestamp: "2 days ago",
    unread: 0,
    online: false,
    isFromContacts: true,
  },
]

// Simulated status updates
const statusUpdates: StatusUpdate[] = [
  {
    id: "own",
    name: "My Status",
    timestamp: "Tap to add status update",
    viewed: false,
    isOwn: true,
    avatar: "ME",
  },
  {
    id: "1",
    name: "Kasun Perera",
    timestamp: "2 hours ago",
    viewed: false,
    avatar: "KP",
  },
  {
    id: "2",
    name: "Nimali Silva",
    timestamp: "5 hours ago",
    viewed: true,
    avatar: "NS",
  },
  {
    id: "3",
    name: "Chaminda Fernando",
    timestamp: "Yesterday",
    viewed: false,
    avatar: "CF",
  },
  {
    id: "4",
    name: "Sanduni Rajapaksa",
    timestamp: "Yesterday",
    viewed: true,
    avatar: "SR",
  },
]

// Simulated call records
const callRecords: CallRecord[] = [
  {
    id: "1",
    name: "Kasun Perera",
    phone: "+94 71 234 5678",
    type: "incoming",
    timestamp: "Today, 2:30 PM",
    duration: "5:23",
    avatar: "KP",
  },
  {
    id: "2",
    name: "Nimali Silva",
    phone: "+94 77 987 6543",
    type: "outgoing",
    timestamp: "Today, 11:45 AM",
    duration: "12:45",
    avatar: "NS",
  },
  {
    id: "3",
    name: "Chaminda Fernando",
    phone: "+94 70 555 1234",
    type: "missed",
    timestamp: "Yesterday, 8:20 PM",
    avatar: "CF",
  },
  {
    id: "4",
    name: "Sanduni Rajapaksa",
    phone: "+94 76 888 9999",
    type: "outgoing",
    timestamp: "Yesterday, 3:15 PM",
    duration: "8:12",
    avatar: "SR",
  },
  {
    id: "5",
    name: "Pradeep Wickramasinghe",
    phone: "+94 75 111 2222",
    type: "incoming",
    timestamp: "2 days ago",
    duration: "3:45",
    avatar: "PW",
  },
]

export function ChatInterface({ userPhone, userName, onLogout }: ChatInterfaceProps) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [showNewChat, setShowNewChat] = useState(false)
  const [newChatPhone, setNewChatPhone] = useState("")
  const [newChatName, setNewChatName] = useState("")

  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadFileName, setUploadFileName] = useState("")

  const [activeTab, setActiveTab] = useState<"chats" | "status" | "calls">("chats")

  const [activeCall, setActiveCall] = useState<{
    contactId: string
    contactName: string
    contactAvatar: string
    callType: "audio" | "video"
    isIncoming: boolean
  } | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (activeTab === "calls" && !activeCall) {
      const timer = setTimeout(() => {
        if (activeTab === "calls" && !activeCall) {
          handleIncomingCall("incoming-1", "Kasun Perera", "KP", "audio")
        }
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [activeTab, activeCall])

  const filteredContacts = phoneContacts.filter(
    (contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || contact.phone.includes(searchQuery),
  )

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return

    const message: Message = {
      id: Date.now().toString(),
      senderId: userPhone,
      text: newMessage.trim(),
      timestamp: new Date(),
      status: "sent",
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === message.id ? { ...msg, status: "delivered" } : msg)))
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  }

  const simulateUpload = (fileName: string) => {
    setIsUploading(true)
    setUploadFileName(fileName)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsUploading(false)
            setUploadFileName("")
            setUploadProgress(0)
          }, 500)
          return 100
        }
        return prev + Math.random() * 15 + 5
      })
    }, 200)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      simulateUpload(file.name)
    }
  }

  const handleStartCall = (
    contactId: string,
    contactName: string,
    contactAvatar: string,
    callType: "audio" | "video",
  ) => {
    setActiveCall({
      contactId,
      contactName,
      contactAvatar,
      callType,
      isIncoming: false,
    })
  }

  const handleIncomingCall = (
    contactId: string,
    contactName: string,
    contactAvatar: string,
    callType: "audio" | "video",
  ) => {
    setActiveCall({
      contactId,
      contactName,
      contactAvatar,
      callType,
      isIncoming: true,
    })
  }

  const handleEndCall = () => {
    setActiveCall(null)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const validateAndCreateNewChat = () => {
    const digits = newChatPhone.replace(/\D/g, "")

    if (!digits.startsWith("94") && !digits.startsWith("0")) {
      return "Please enter a valid Sri Lankan number"
    }

    if ((digits.startsWith("94") && digits.length !== 11) || (digits.startsWith("0") && digits.length !== 10)) {
      return "Please enter a complete phone number"
    }

    if (!newChatName.trim()) {
      return "Please enter a name for this contact"
    }

    return null
  }

  const createNewChat = () => {
    const error = validateAndCreateNewChat()
    if (error) {
      alert(error)
      return
    }

    const formattedPhone = newChatPhone.startsWith("0")
      ? "+94" + newChatPhone.substring(1)
      : newChatPhone.startsWith("94")
        ? "+" + newChatPhone
        : newChatPhone

    const newContact: Contact = {
      id: Date.now().toString(),
      name: newChatName.trim(),
      phone: formattedPhone,
      lastMessage: "Start a conversation...",
      timestamp: "now",
      unread: 0,
      online: false,
      isFromContacts: false,
    }

    // Add to contacts list (you'd normally save this to your backend)
    phoneContacts.unshift(newContact)

    // Select the new contact
    setSelectedContact(newContact)
    setShowNewChat(false)
    setNewChatPhone("")
    setNewChatName("")
  }

  const getCallIcon = (type: string) => {
    switch (type) {
      case "incoming":
        return <PhoneIncoming className="h-4 w-4 text-green-600 dark:text-green-400" />
      case "outgoing":
        return <PhoneOutgoing className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case "missed":
        return <PhoneMissed className="h-4 w-4 text-red-600 dark:text-red-400" />
      default:
        return <PhoneCall className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "chats":
        return (
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className="p-5 border-b border-gray-100/50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 cursor-pointer flex items-center gap-4 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="relative">
                  <Avatar className="h-14 w-14 shadow-sm">
                    <AvatarFallback
                      className={`font-bold text-lg ${
                        contact.isFromContacts
                          ? "bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 dark:from-blue-900 dark:to-purple-900 dark:text-blue-300"
                          : "bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 dark:from-green-900 dark:to-emerald-900 dark:text-green-300"
                      }`}
                    >
                      {getInitials(contact.name)}
                    </AvatarFallback>
                  </Avatar>
                  {contact.online && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white dark:border-gray-900 shadow-sm"></div>
                  )}
                  <div
                    className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center shadow-sm ${
                      contact.isFromContacts ? "bg-blue-500" : "bg-green-500"
                    }`}
                  >
                    {contact.isFromContacts ? (
                      <Users className="h-2.5 w-2.5 text-white" />
                    ) : (
                      <Plus className="h-2.5 w-2.5 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate text-lg">{contact.name}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{contact.timestamp}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 truncate">{contact.lastMessage}</p>
                  {!contact.isFromContacts && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">New Contact</p>
                  )}
                </div>
                {contact.unread > 0 && (
                  <Badge className="bg-blue-500 dark:bg-blue-600 text-white text-sm min-w-[24px] h-6 rounded-full shadow-sm">
                    {contact.unread}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )

      case "status":
        return (
          <div className="flex-1 overflow-y-auto">
            {statusUpdates.map((status) => (
              <div
                key={status.id}
                className="p-5 border-b border-gray-100/50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 cursor-pointer flex items-center gap-4 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="relative">
                  <Avatar className="h-14 w-14 shadow-sm">
                    <AvatarFallback
                      className={`font-bold text-lg ${
                        status.isOwn
                          ? "bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 dark:from-green-900 dark:to-emerald-900 dark:text-green-300"
                          : "bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 dark:from-blue-900 dark:to-purple-900 dark:text-blue-300"
                      }`}
                    >
                      {status.isOwn ? getInitials(userName) : status.avatar}
                    </AvatarFallback>
                  </Avatar>
                  {status.isOwn ? (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center shadow-sm">
                      <Plus className="h-2.5 w-2.5 text-white" />
                    </div>
                  ) : (
                    <div
                      className={`absolute -top-1 -left-1 -right-1 -bottom-1 rounded-full border-3 ${
                        status.viewed
                          ? "border-gray-300 dark:border-gray-600"
                          : "border-green-500 dark:border-green-400"
                      }`}
                    ></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate text-lg">
                      {status.isOwn ? "My Status" : status.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {!status.isOwn && !status.viewed && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                      <span className="text-sm text-gray-500 dark:text-gray-400">{status.timestamp}</span>
                    </div>
                  </div>
                  {status.isOwn ? (
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Tap to add status update</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Eye className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {status.viewed ? "Viewed" : "New"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )

      case "calls":
        return (
          <div className="flex-1 overflow-y-auto">
            {callRecords.map((call) => (
              <div
                key={call.id}
                className="p-5 border-b border-gray-100/50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 cursor-pointer flex items-center gap-4 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="relative">
                  <Avatar className="h-14 w-14 shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 dark:from-blue-900 dark:to-purple-900 dark:text-blue-300 font-bold text-lg">
                      {call.avatar}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate text-lg">{call.name}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartCall(call.id, call.name, call.avatar, "audio")}
                      className="h-8 w-8 p-0 rounded-full hover:bg-green-50 dark:hover:bg-green-900/30"
                    >
                      <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    {getCallIcon(call.type)}
                    <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">{call.type}</span>
                    {call.duration && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{call.duration}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">{call.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  if (selectedContact) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-black dark:via-gray-950 dark:to-blue-950 flex flex-col transition-all duration-500">
        {/* Chat Header */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-b border-gray-200/30 dark:border-gray-700/30 p-5 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedContact(null)}
            className="h-10 w-10 p-0 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-white/30 shadow-lg">
              <AvatarFallback className="bg-white/20 backdrop-blur-sm text-white font-bold text-lg">
                {getInitials(selectedContact.name)}
              </AvatarFallback>
            </Avatar>
            {selectedContact.online && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"></div>
            )}
            {selectedContact.isFromContacts && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center shadow-sm">
                <Users className="h-2 w-2 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2
              className="font-bold text-gray-900 dark:text-white text-lg"
              style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}
            >
              {selectedContact.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedContact.online ? "Online" : "Last seen recently"}
              {selectedContact.isFromContacts && " • From Contacts"}
            </p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                handleStartCall(selectedContact.id, selectedContact.name, getInitials(selectedContact.name), "audio")
              }
              className="h-10 w-10 p-0 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300"
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                handleStartCall(selectedContact.id, selectedContact.name, getInitials(selectedContact.name), "video")
              }
              className="h-10 w-10 p-0 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300"
            >
              <Video className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl mb-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                <MessageCircle className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Start your conversation with {selectedContact.name}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === userPhone ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-5 py-4 rounded-3xl shadow-sm backdrop-blur-sm transition-all duration-300 ${
                    message.senderId === userPhone
                      ? "bg-blue-500/90 text-white shadow-blue-500/20"
                      : "bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 border border-gray-200/50 dark:border-gray-700/50 shadow-gray-500/10"
                  }`}
                >
                  <p className="leading-relaxed">{message.text}</p>
                  <div className="flex items-center justify-end gap-2 mt-3">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {message.senderId === userPhone && (
                      <div className="text-xs">
                        {message.status === "sent" && <Check className="h-3 w-3" />}
                        {message.status === "delivered" && <CheckCheck className="h-3 w-3" />}
                        {message.status === "read" && <CheckCheck className="h-3 w-3 text-blue-300" />}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-t border-gray-200/30 dark:border-gray-700/30">
          {/* Upload Status Bar */}
          <div
            className={`transition-all duration-700 ease-out overflow-hidden ${
              isUploading ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-5 bg-gradient-to-r from-blue-50/90 via-purple-50/90 to-indigo-50/90 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-indigo-950/40 backdrop-blur-3xl border-b border-white/30 dark:border-gray-700/30 relative overflow-hidden">
              <div className="absolute top-0 left-1/4 w-16 h-16 bg-blue-400/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute bottom-0 right-1/3 w-12 h-12 bg-purple-400/10 rounded-full blur-lg animate-pulse delay-500"></div>

              <div className="flex items-center gap-5 relative z-10">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                      Uploading {uploadFileName}
                    </span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/30 px-2 py-1 rounded-lg backdrop-blur-sm">
                      {Math.round(uploadProgress)}%
                    </span>
                  </div>

                  <div className="relative h-3 bg-white/40 dark:bg-gray-800/40 rounded-full overflow-hidden backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 via-purple-200/20 to-blue-200/20 animate-pulse delay-300"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse delay-700"></div>
                    </div>

                    <div
                      className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out shadow-2xl relative overflow-hidden"
                      style={{
                        width: `${uploadProgress}%`,
                        background: `linear-gradient(135deg, 
                          rgba(59, 130, 246, 0.95) 0%, 
                          rgba(147, 51, 234, 0.95) 25%, 
                          rgba(59, 130, 246, 0.95) 50%, 
                          rgba(99, 102, 241, 0.95) 75%, 
                          rgba(59, 130, 246, 0.95) 100%)`,
                        boxShadow: `
                          0 0 30px rgba(59, 130, 246, 0.6),
                          inset 0 2px 0 rgba(255, 255, 255, 0.4),
                          inset 0 -1px 0 rgba(0, 0, 0, 0.1),
                          0 4px 15px rgba(59, 130, 246, 0.3)
                        `,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-full"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-pulse"></div>
                      <div
                        className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-white/30 via-white/10 to-transparent rounded-full"
                        style={{
                          animation: "wave 2s ease-in-out infinite",
                        }}
                      ></div>
                      <div className="absolute top-1 left-1/4 w-1 h-1 bg-white/60 rounded-full animate-ping"></div>
                      <div className="absolute top-1 right-1/3 w-1 h-1 bg-white/60 rounded-full animate-ping delay-500"></div>
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)`,
                          animation: "shimmer 3s ease-in-out infinite",
                        }}
                      ></div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/10 rounded-full pointer-events-none"></div>
                    <div className="absolute inset-0 rounded-full border border-blue-400/20 shadow-lg shadow-blue-500/20"></div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-400/20 dark:to-purple-400/20 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-blue-500/30 dark:border-blue-400/30 shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-2xl animate-pulse"></div>
                    <div className={`transition-all duration-500 relative z-10 ${isUploading ? "animate-spin" : ""}`}>
                      <svg
                        className="w-5 h-5 text-blue-600 dark:text-blue-400 drop-shadow-sm"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-2xl pointer-events-none"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <style jsx>{`
            @keyframes wave {
              0%, 100% { transform: translateX(0) scaleX(1); }
              50% { transform: translateX(-10px) scaleX(1.1); }
            }
            
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}</style>

          {/* Message Input Area */}
          <div className="p-6">
            <div className="flex gap-4">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 h-14 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 focus:border-blue-500 dark:focus:border-blue-400 rounded-3xl backdrop-blur-sm text-lg transition-all duration-300"
              />

              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                />
                <Button className="h-14 w-14 bg-gray-100/80 hover:bg-gray-200/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 rounded-3xl shadow-lg p-0 transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <Plus className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </Button>
              </div>

              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="h-14 w-14 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-3xl shadow-lg shadow-blue-500/25 dark:shadow-blue-500/20 p-0 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-black dark:via-gray-950 dark:to-blue-950 flex transition-all duration-500">
      {/* Main Content */}
      <div className="w-full md:w-96 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-r border-gray-200/30 dark:border-gray-700/30 flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-500/90 to-purple-600/90 dark:from-blue-600/95 dark:to-purple-700/95 text-white backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-white/30 shadow-lg">
                <AvatarFallback className="bg-white/20 backdrop-blur-sm text-white font-bold text-lg">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2
                  className="font-bold text-xl"
                  style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}
                >
                  {userName}
                </h2>
                <p className="text-sm opacity-90">{userPhone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-white hover:bg-white/15 h-10 w-10 p-0 rounded-xl backdrop-blur-sm transition-all duration-300"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/15 border-white/30 text-white placeholder:text-white/60 focus:bg-white/25 h-12 rounded-2xl backdrop-blur-sm transition-all duration-300"
            />
          </div>
        </div>

        {/* Tab Header */}
        <div className="px-6 py-4 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeTab === "chats" && <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
              {activeTab === "status" && <Circle className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
              {activeTab === "calls" && <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
              <span className="font-semibold text-gray-700 dark:text-gray-300 capitalize">
                {activeTab === "chats" && `Contacts (${filteredContacts.length})`}
                {activeTab === "status" && `Status (${statusUpdates.length})`}
                {activeTab === "calls" && `Calls (${callRecords.length})`}
              </span>
            </div>
            {activeTab === "chats" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300"
                onClick={() => setShowNewChat(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              transform: `translateX(${activeTab === "chats" ? "0%" : activeTab === "status" ? "-100%" : "-200%"})`,
            }}
          >
            <div className="flex h-full">
              {/* Chats Tab */}
              <div className="w-full flex-shrink-0 overflow-y-auto">{renderTabContent()}</div>
              {/* Status Tab */}
              <div className="w-full flex-shrink-0 overflow-y-auto">{renderTabContent()}</div>
              {/* Calls Tab */}
              <div className="w-full flex-shrink-0 overflow-y-auto">{renderTabContent()}</div>
            </div>
          </div>
        </div>

        {/* Bottom Tab Navigation */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border-t border-gray-200/30 dark:border-gray-700/30 p-4">
          <div className="flex items-center justify-around">
            <Button
              variant="ghost"
              onClick={() => setActiveTab("chats")}
              className={`flex flex-col items-center gap-1 h-auto py-3 px-6 rounded-2xl transition-all duration-300 ${
                activeTab === "chats"
                  ? "bg-blue-100/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/30"
              }`}
            >
              <MessageCircle
                className={`h-6 w-6 transition-all duration-300 ${activeTab === "chats" ? "scale-110" : ""}`}
              />
              <span className="text-xs font-medium">Chats</span>
              {activeTab === "chats" && <div className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full mt-1"></div>}
            </Button>

            <Button
              variant="ghost"
              onClick={() => setActiveTab("status")}
              className={`flex flex-col items-center gap-1 h-auto py-3 px-6 rounded-2xl transition-all duration-300 ${
                activeTab === "status"
                  ? "bg-green-100/80 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/30"
              }`}
            >
              <Circle className={`h-6 w-6 transition-all duration-300 ${activeTab === "status" ? "scale-110" : ""}`} />
              <span className="text-xs font-medium">Status</span>
              {activeTab === "status" && (
                <div className="w-1 h-1 bg-green-600 dark:bg-green-400 rounded-full mt-1"></div>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={() => setActiveTab("calls")}
              className={`flex flex-col items-center gap-1 h-auto py-3 px-6 rounded-2xl transition-all duration-300 ${
                activeTab === "calls"
                  ? "bg-purple-100/80 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/30"
              }`}
            >
              <Phone className={`h-6 w-6 transition-all duration-300 ${activeTab === "calls" ? "scale-110" : ""}`} />
              <span className="text-xs font-medium">Calls</span>
              {activeTab === "calls" && (
                <div className="w-1 h-1 bg-purple-600 dark:bg-purple-400 rounded-full mt-1"></div>
              )}
            </Button>
          </div>
        </div>

        {/* New Chat Modal */}
        {showNewChat && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 w-full max-w-md">
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                  <h3
                    className="text-xl font-bold text-gray-900 dark:text-white"
                    style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}
                  >
                    New Chat
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowNewChat(false)
                      setNewChatPhone("")
                      setNewChatName("")
                    }}
                    className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    ✕
                  </Button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Start a conversation with someone new</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Phone Number</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">+94</span>
                    </div>
                    <Input
                      type="tel"
                      placeholder="77 123 4567"
                      value={newChatPhone}
                      onChange={(e) => setNewChatPhone(e.target.value)}
                      className="pl-16 h-12 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 focus:border-blue-500 dark:focus:border-blue-400 rounded-2xl backdrop-blur-sm transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Contact Name</label>
                  <Input
                    type="text"
                    placeholder="Enter contact name"
                    value={newChatName}
                    onChange={(e) => setNewChatName(e.target.value)}
                    className="h-12 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 focus:border-blue-500 dark:focus:border-blue-400 rounded-2xl backdrop-blur-sm transition-all duration-300"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNewChat(false)
                      setNewChatPhone("")
                      setNewChatName("")
                    }}
                    className="flex-1 h-12 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-2xl backdrop-blur-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createNewChat}
                    className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 dark:shadow-blue-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                    disabled={!newChatPhone.trim() || !newChatName.trim()}
                  >
                    Start Chat
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State for larger screens */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-gray-50/50 to-blue-50/50 dark:from-gray-900/50 dark:to-slate-800/50 backdrop-blur-sm">
        <div className="text-center space-y-8">
          <div className="inline-flex p-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-4xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
            {activeTab === "chats" && <MessageCircle className="h-20 w-20 text-gray-400 dark:text-gray-600" />}
            {activeTab === "status" && <Circle className="h-20 w-20 text-gray-400 dark:text-gray-600" />}
            {activeTab === "calls" && <Phone className="h-20 w-20 text-gray-400 dark:text-gray-600" />}
          </div>
          <div className="space-y-3">
            <h3
              className="text-4xl font-black text-gray-700 dark:text-gray-300"
              style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}
            >
              Welcome to Hey
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md text-lg leading-relaxed">
              {activeTab === "chats" && "Select a contact to start a beautiful conversation"}
              {activeTab === "status" && "View and share status updates with your contacts"}
              {activeTab === "calls" && "Make calls and view your call history"}
            </p>
          </div>
        </div>
      </div>

      {/* Call Interface */}
      {activeCall && (
        <CallInterface
          contactName={activeCall.contactName}
          contactAvatar={activeCall.contactAvatar}
          callType={activeCall.callType}
          onEndCall={handleEndCall}
          isIncoming={activeCall.isIncoming}
          onAccept={() => {
            // Handle call acceptance
          }}
          onReject={handleEndCall}
        />
      )}
    </div>
  )
}
