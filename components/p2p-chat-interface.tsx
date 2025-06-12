"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MessageCircle,
  Send,
  Users,
  Wifi,
  WifiOff,
  UserPlus,
  Check,
  X,
  Copy,
  Share,
  Globe,
  Shield,
  Zap,
} from "lucide-react"
import { useP2PChat } from "@/hooks/use-p2p-chat"
import { ThemeToggle } from "@/components/theme-toggle"

interface P2PChatInterfaceProps {
  userId: string
  userName: string
  userPhone: string
  onLogout: () => void
}

export function P2PChatInterface({ userId, userName, userPhone, onLogout }: P2PChatInterfaceProps) {
  const {
    isConnected,
    peerId,
    discoveredUsers,
    connectedPeers,
    contactRequests,
    contacts,
    mutualContacts,
    sendMessage,
    sendContactRequest,
    acceptContactRequest,
    connectToPeer,
    getMessages,
  } = useP2PChat({ userId, userName, userPhone })

  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [connectPeerId, setConnectPeerId] = useState("")
  const [activeTab, setActiveTab] = useState<"chats" | "discover" | "requests">("chats")

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return

    const success = sendMessage(selectedContact, newMessage.trim())
    if (success) {
      setNewMessage("")
    }
  }

  const copyPeerId = () => {
    if (peerId) {
      navigator.clipboard.writeText(peerId)
      alert("Peer ID copied to clipboard!")
    }
  }

  const sharePeerId = () => {
    if (peerId && navigator.share) {
      navigator.share({
        title: "Connect with me on Hey P2P",
        text: `Connect with me using this Peer ID: ${peerId}`,
        url: `https://hey-chat.app/connect/${peerId}`,
      })
    }
  }

  const handleConnectToPeer = async () => {
    if (!connectPeerId.trim()) return

    const success = await connectToPeer(connectPeerId.trim())
    if (success) {
      setShowConnectModal(false)
      setConnectPeerId("")
      alert("Connected successfully!")
    } else {
      alert("Failed to connect. Check the Peer ID and try again.")
    }
  }

  const selectedContactData = mutualContacts.find((c) => c.id === selectedContact)
  const selectedMessages = selectedContact ? getMessages(selectedContact) : []

  if (selectedContact && selectedContactData) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-black dark:via-gray-950 dark:to-blue-950 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-b border-gray-200/30 dark:border-gray-700/30 p-5 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedContact(null)}
            className="h-10 w-10 p-0 rounded-xl"
          >
            ←
          </Button>
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 dark:from-blue-900 dark:to-purple-900 dark:text-blue-300 font-bold">
              {getInitials(selectedContactData.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900 dark:text-white">{selectedContactData.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {connectedPeers.includes(selectedContactData.peerId) ? "🟢 Connected" : "🔴 Offline"}
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {selectedMessages.length === 0 ? (
            <div className="text-center py-16">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Start your P2P conversation</p>
            </div>
          ) : (
            selectedMessages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === userId ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl ${
                    message.sender === userId
                      ? "bg-blue-500 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border"
                  }`}
                >
                  <p>{message.content.text}</p>
                  <p className="text-xs opacity-70 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-t border-gray-200/30 dark:border-gray-700/30 p-6">
          <div className="flex gap-4">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 h-12 rounded-2xl"
              disabled={!connectedPeers.includes(selectedContactData.peerId)}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !connectedPeers.includes(selectedContactData.peerId)}
              className="h-12 w-12 rounded-2xl p-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          {!connectedPeers.includes(selectedContactData.peerId) && (
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-2 text-center">
              User is offline - messages will be delivered when they come online
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-black dark:via-gray-950 dark:to-blue-950 flex flex-col">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-green-500/90 to-blue-600/90 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-white/30">
              <AvatarFallback className="bg-white/20 text-white font-bold">{getInitials(userName)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold text-xl">{userName}</h2>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <Wifi className="h-4 w-4" /> <span className="text-sm">P2P Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4" /> <span className="text-sm">Connecting...</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-white hover:bg-white/15 h-10 w-10 p-0 rounded-xl"
            >
              ⚙️
            </Button>
          </div>
        </div>

        {/* P2P Info Card */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Serverless P2P Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Your Peer ID:</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyPeerId}
                  className="h-8 px-3 bg-white/10 hover:bg-white/20 text-white"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                {navigator.share && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={sharePeerId}
                    className="h-8 px-3 bg-white/10 hover:bg-white/20 text-white"
                  >
                    <Share className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs bg-white/10 p-2 rounded font-mono break-all">{peerId || "Generating..."}</p>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{discoveredUsers.length} discovered</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span>{connectedPeers.length} connected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50">
        {[
          { id: "chats", label: "Chats", icon: MessageCircle, count: mutualContacts.length },
          { id: "discover", label: "Discover", icon: Globe, count: discoveredUsers.length },
          { id: "requests", label: "Requests", icon: UserPlus, count: contactRequests.length },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 h-14 rounded-none border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                : "border-transparent text-gray-600 dark:text-gray-400"
            }`}
          >
            <tab.icon className="h-5 w-5 mr-2" />
            {tab.label}
            {tab.count > 0 && <Badge className="ml-2 bg-blue-500 text-white text-xs">{tab.count}</Badge>}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "chats" && (
          <div className="p-4 space-y-3">
            {mutualContacts.length === 0 ? (
              <div className="text-center py-16">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No contacts yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Discover users and send contact requests to start chatting
                </p>
              </div>
            ) : (
              mutualContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact.id)}
                  className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-800/90 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 dark:from-blue-900 dark:to-purple-900 dark:text-blue-300 font-bold">
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{contact.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {connectedPeers.includes(contact.peerId) ? "🟢 Online" : "🔴 Offline"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">P2P Contact</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "discover" && (
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Discovered Users</h3>
              <Button
                onClick={() => setShowConnectModal(true)}
                className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Connect
              </Button>
            </div>

            {discoveredUsers
              .filter((user) => !contacts.includes(user.id))
              .map((user) => (
                <div
                  key={user.id}
                  className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 dark:from-green-900 dark:to-emerald-900 dark:text-green-300 font-bold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</p>
                      <p className="text-xs text-gray-400">
                        {connectedPeers.includes(user.peerId) ? "🟢 Connected" : "🔴 Not connected"}
                      </p>
                    </div>
                    <Button
                      onClick={() => sendContactRequest(user.id)}
                      className="h-10 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              ))}

            {discoveredUsers.filter((user) => !contacts.includes(user.id)).length === 0 && (
              <div className="text-center py-16">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No users discovered yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Share your Peer ID with others to connect</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <div className="p-4 space-y-3">
            {contactRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-orange-100 to-red-100 text-orange-700 dark:from-orange-900 dark:to-red-900 dark:text-orange-300 font-bold">
                      {getInitials(request.senderName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{request.senderName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Wants to connect</p>
                    <p className="text-xs text-gray-400">{new Date(request.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => acceptContactRequest(request.sender)}
                      className="h-10 w-10 p-0 bg-green-500 hover:bg-green-600 text-white rounded-xl"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 w-10 p-0 border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {contactRequests.length === 0 && (
              <div className="text-center py-16">
                <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No contact requests</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 w-full max-w-md">
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Connect to Peer</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConnectModal(false)}
                  className="h-8 w-8 p-0 rounded-full"
                >
                  ✕
                </Button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Enter a Peer ID to connect directly</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Peer ID</label>
                <Input
                  placeholder="Enter peer ID..."
                  value={connectPeerId}
                  onChange={(e) => setConnectPeerId(e.target.value)}
                  className="h-12 rounded-2xl font-mono text-sm"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConnectModal(false)}
                  className="flex-1 h-12 rounded-2xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConnectToPeer}
                  disabled={!connectPeerId.trim()}
                  className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl"
                >
                  Connect
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
