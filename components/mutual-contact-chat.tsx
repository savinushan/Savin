"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Shield,
  UserCheck,
  UserX,
  AlertCircle,
  Lock,
  Unlock,
  Globe,
  Smartphone,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { ContactVerificationService, type ContactInfo } from "@/lib/contact-verification-service"

interface MutualContactChatProps {
  userPhone: string
  userName: string
  contacts: ContactInfo[]
  onLogout: () => void
  onResyncContacts: () => void
}

interface Message {
  id: string
  senderId: string
  senderName: string
  text: string
  timestamp: Date
  status: "sent" | "delivered" | "read"
}

export function MutualContactChat({
  userPhone,
  userName,
  contacts,
  onLogout,
  onResyncContacts,
}: MutualContactChatProps) {
  const [selectedContact, setSelectedContact] = useState<ContactInfo | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [contactService] = useState(() => new ContactVerificationService(userPhone))
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const mutualContacts = contacts.filter((contact) => contact.isMutual)
  const oneWayContacts = contacts.filter((contact) => !contact.isMutual)

  const filteredMutualContacts = mutualContacts.filter(
    (contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || contact.phone.includes(searchQuery),
  )

  const filteredOneWayContacts = oneWayContacts.filter(
    (contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || contact.phone.includes(searchQuery),
  )

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedContact || !selectedContact.isMutual) return

    const message: Message = {
      id: Date.now().toString(),
      senderId: userPhone,
      senderName: userName,
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
            <Avatar className="h-12 w-12 shadow-sm">
              <AvatarFallback
                className={`font-bold ${
                  selectedContact.isMutual
                    ? "bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 dark:from-green-900 dark:to-emerald-900 dark:text-green-300"
                    : "bg-gradient-to-br from-orange-100 to-red-100 text-orange-700 dark:from-orange-900 dark:to-red-900 dark:text-orange-300"
                }`}
              >
                {getInitials(selectedContact.name)}
              </AvatarFallback>
            </Avatar>
            {selectedContact.online && selectedContact.isMutual && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"></div>
            )}
            <div
              className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center shadow-sm ${
                selectedContact.isMutual ? "bg-green-500" : "bg-orange-500"
              }`}
            >
              {selectedContact.isMutual ? (
                <UserCheck className="h-2 w-2 text-white" />
              ) : (
                <UserX className="h-2 w-2 text-white" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <h2
              className="font-bold text-gray-900 dark:text-white text-lg"
              style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}
            >
              {selectedContact.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedContact.isMutual
                ? selectedContact.online
                  ? "🟢 Online • Mutual Contact"
                  : "🔴 Offline • Mutual Contact"
                : "⚠️ Doesn't have your number"}
            </p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              disabled={!selectedContact.isMutual}
              className="h-10 w-10 p-0 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300 disabled:opacity-50"
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!selectedContact.isMutual}
              className="h-10 w-10 p-0 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300 disabled:opacity-50"
            >
              <Video className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!selectedContact.isMutual ? (
            <div className="text-center py-16">
              <div className="inline-flex p-6 bg-orange-50/80 dark:bg-orange-950/30 backdrop-blur-xl rounded-3xl mb-6 shadow-lg border border-orange-200/50 dark:border-orange-800/50">
                <Lock className="h-12 w-12 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Messaging Not Available</h3>
              <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md mx-auto leading-relaxed mb-4">
                {selectedContact.name} doesn't have your number ({userPhone}) in their contacts. You can only message
                people who have your number saved.
              </p>
              <div className="bg-blue-50/80 dark:bg-blue-950/30 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50 rounded-2xl p-4 max-w-md mx-auto">
                <div className="flex items-start gap-3">
                  <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-blue-700 dark:text-blue-300 text-sm font-medium mb-1">
                      How to enable messaging:
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 text-sm">
                      Ask {selectedContact.name} to save your number ({userPhone}) in their phone contacts, then restart
                      Hey.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex p-6 bg-green-50/80 dark:bg-green-950/30 backdrop-blur-xl rounded-3xl mb-6 shadow-lg border border-green-200/50 dark:border-green-800/50">
                <MessageCircle className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Secure Messaging Enabled</h3>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Start your conversation with {selectedContact.name}
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">Mutual contact verified</span>
              </div>
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
                      ? "bg-green-500/90 text-white shadow-green-500/20"
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
                        {message.status === "read" && <CheckCheck className="h-3 w-3 text-green-300" />}
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
        {selectedContact.isMutual && (
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-t border-gray-200/30 dark:border-gray-700/30 p-6">
            <div className="flex gap-4">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 h-14 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 focus:border-green-500 dark:focus:border-green-400 rounded-3xl backdrop-blur-sm text-lg transition-all duration-300"
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="h-14 w-14 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 rounded-3xl shadow-lg shadow-green-500/25 dark:shadow-green-500/20 p-0 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-black dark:via-gray-950 dark:to-blue-950 flex transition-all duration-500">
      {/* Main Content */}
      <div className="w-full md:w-96 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-r border-gray-200/30 dark:border-gray-700/30 flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-green-500/90 to-blue-600/90 dark:from-green-600/95 dark:to-blue-700/95 text-white backdrop-blur-xl">
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
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/15 border-white/30 text-white placeholder:text-white/60 focus:bg-white/25 h-12 rounded-2xl backdrop-blur-sm transition-all duration-300"
            />
          </div>
        </div>

        {/* Contact Stats */}
        <div className="px-6 py-4 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Mutual Contacts ({mutualContacts.length})
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onResyncContacts}
              className="h-8 px-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 transition-all duration-300"
            >
              <Globe className="h-4 w-4 mr-1" />
              Sync
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div className="text-center p-2 bg-green-50/50 dark:bg-green-950/20 rounded-xl">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">{mutualContacts.length}</div>
              <div className="text-xs text-green-700 dark:text-green-300">Can Message</div>
            </div>
            <div className="text-center p-2 bg-orange-50/50 dark:bg-orange-950/20 rounded-xl">
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{oneWayContacts.length}</div>
              <div className="text-xs text-orange-700 dark:text-orange-300">One-Way</div>
            </div>
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {/* Mutual Contacts */}
          {filteredMutualContacts.length > 0 && (
            <div>
              <div className="px-6 py-3 bg-green-50/50 dark:bg-green-950/20 border-b border-green-200/50 dark:border-green-800/50">
                <div className="flex items-center gap-2">
                  <Unlock className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                    Can Message ({filteredMutualContacts.length})
                  </span>
                </div>
              </div>
              {filteredMutualContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className="p-5 border-b border-gray-100/50 dark:border-gray-800/50 hover:bg-green-50/30 dark:hover:bg-green-900/10 cursor-pointer flex items-center gap-4 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="relative">
                    <Avatar className="h-14 w-14 shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 dark:from-green-900 dark:to-emerald-900 dark:text-green-300 font-bold text-lg">
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    {contact.online && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white dark:border-gray-900 shadow-sm"></div>
                    )}
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center shadow-sm">
                      <UserCheck className="h-2.5 w-2.5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate text-lg">{contact.name}</h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {contact.online ? "Online" : "Offline"}
                      </span>
                    </div>
                    <p className="text-green-600 dark:text-green-400 text-sm">✓ Mutual contact • Can message</p>
                  </div>
                  <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              ))}
            </div>
          )}

          {/* One-Way Contacts */}
          {filteredOneWayContacts.length > 0 && (
            <div>
              <div className="px-6 py-3 bg-orange-50/50 dark:bg-orange-950/20 border-b border-orange-200/50 dark:border-orange-800/50">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                    Can't Message ({filteredOneWayContacts.length})
                  </span>
                </div>
              </div>
              {filteredOneWayContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className="p-5 border-b border-gray-100/50 dark:border-gray-800/50 hover:bg-orange-50/30 dark:hover:bg-orange-900/10 cursor-pointer flex items-center gap-4 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="relative">
                    <Avatar className="h-14 w-14 shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-orange-100 to-red-100 text-orange-700 dark:from-orange-900 dark:to-red-900 dark:text-orange-300 font-bold text-lg">
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center shadow-sm">
                      <UserX className="h-2.5 w-2.5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate text-lg">{contact.name}</h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">On Hey</span>
                    </div>
                    <p className="text-orange-600 dark:text-orange-400 text-sm flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Doesn't have your number
                    </p>
                  </div>
                  <Lock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredMutualContacts.length === 0 && filteredOneWayContacts.length === 0 && (
            <div className="text-center py-16 px-6">
              <div className="inline-flex p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl mb-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Contacts Found</h3>
              <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-4">
                {searchQuery ? "No contacts match your search" : "No mutual contacts found"}
              </p>
              <Button
                onClick={onResyncContacts}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl px-6 py-3"
              >
                <Globe className="h-4 w-4 mr-2" />
                Sync Contacts
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Empty State for larger screens */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-gray-50/50 to-blue-50/50 dark:from-gray-900/50 dark:to-slate-800/50 backdrop-blur-sm">
        <div className="text-center space-y-8">
          <div className="inline-flex p-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-4xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
            <Shield className="h-20 w-20 text-gray-400 dark:text-gray-600" />
          </div>
          <div className="space-y-3">
            <h3
              className="text-4xl font-black text-gray-700 dark:text-gray-300"
              style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}
            >
              Secure Messaging
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md text-lg leading-relaxed">
              Select a mutual contact to start a secure conversation. Only people who have your number can message you.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
