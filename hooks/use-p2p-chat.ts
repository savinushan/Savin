"use client"

import { useState, useEffect, useRef } from "react"
import { P2PService, type P2PMessage, type P2PUser } from "@/lib/p2p-service"

interface UseP2PChatProps {
  userId: string
  userName: string
  userPhone: string
}

export function useP2PChat({ userId, userName, userPhone }: UseP2PChatProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [discoveredUsers, setDiscoveredUsers] = useState<P2PUser[]>([])
  const [connectedPeers, setConnectedPeers] = useState<string[]>([])
  const [messages, setMessages] = useState<Map<string, P2PMessage[]>>(new Map())
  const [contactRequests, setContactRequests] = useState<P2PMessage[]>([])
  const [contacts, setContacts] = useState<Set<string>>(new Set())
  const [peerId, setPeerId] = useState<string | null>(null)

  const p2pServiceRef = useRef<P2PService | null>(null)

  // Initialize P2P service
  useEffect(() => {
    const initP2P = async () => {
      p2pServiceRef.current = new P2PService()

      // Set local user
      p2pServiceRef.current.setLocalUser({
        id: userId,
        name: userName,
        phone: userPhone,
      })

      // Subscribe to messages
      p2pServiceRef.current.onMessage((message: P2PMessage) => {
        handleIncomingMessage(message)
      })

      // Subscribe to user updates
      p2pServiceRef.current.onUserUpdate((users: P2PUser[]) => {
        setDiscoveredUsers(users)
      })

      // Subscribe to connection updates
      p2pServiceRef.current.onConnectionUpdate((peerId: string, connected: boolean) => {
        if (connected) {
          setConnectedPeers((prev) => [...prev.filter((id) => id !== peerId), peerId])
        } else {
          setConnectedPeers((prev) => prev.filter((id) => id !== peerId))
        }
      })

      // Wait for peer ID
      const checkPeerId = () => {
        const id = p2pServiceRef.current?.getPeerId()
        if (id) {
          setPeerId(id)
          setIsConnected(true)
        } else {
          setTimeout(checkPeerId, 1000)
        }
      }
      checkPeerId()
    }

    initP2P()

    // Load saved contacts
    const savedContacts = localStorage.getItem("p2p-contacts")
    if (savedContacts) {
      setContacts(new Set(JSON.parse(savedContacts)))
    }

    // Load saved messages
    const savedMessages = localStorage.getItem("p2p-messages")
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages)
      const messageMap = new Map()
      Object.entries(parsed).forEach(([key, value]) => {
        messageMap.set(key, value)
      })
      setMessages(messageMap)
    }

    return () => {
      p2pServiceRef.current?.disconnect()
    }
  }, [userId, userName, userPhone])

  // Handle incoming messages
  const handleIncomingMessage = (message: P2PMessage) => {
    switch (message.type) {
      case "message":
        if (contacts.has(message.sender)) {
          addMessage(message.sender, message)
        }
        break

      case "contact-request":
        setContactRequests((prev) => [...prev, message])
        break

      case "contact-accept":
        // Add to contacts
        const newContacts = new Set([...contacts, message.sender])
        setContacts(newContacts)
        localStorage.setItem("p2p-contacts", JSON.stringify([...newContacts]))
        break
    }
  }

  // Add message to conversation
  const addMessage = (conversationId: string, message: P2PMessage) => {
    setMessages((prev) => {
      const newMessages = new Map(prev)
      const conversation = newMessages.get(conversationId) || []
      newMessages.set(conversationId, [...conversation, message])

      // Save to localStorage
      const toSave: any = {}
      newMessages.forEach((value, key) => {
        toSave[key] = value
      })
      localStorage.setItem("p2p-messages", JSON.stringify(toSave))

      return newMessages
    })
  }

  // Send message
  const sendMessage = (recipientId: string, content: string): boolean => {
    if (!p2pServiceRef.current || !contacts.has(recipientId)) return false

    const success = p2pServiceRef.current.sendMessage(recipientId, content)

    if (success) {
      // Add to local messages
      const message: P2PMessage = {
        id: Date.now().toString(),
        type: "message",
        sender: userId,
        senderName: userName,
        recipient: recipientId,
        content: { text: content },
        timestamp: new Date(),
      }
      addMessage(recipientId, message)
    }

    return success
  }

  // Send contact request
  const sendContactRequest = (recipientId: string): boolean => {
    if (!p2pServiceRef.current) return false
    return p2pServiceRef.current.sendContactRequest(recipientId)
  }

  // Accept contact request
  const acceptContactRequest = (requesterId: string) => {
    if (!p2pServiceRef.current) return

    p2pServiceRef.current.acceptContactRequest(requesterId)

    // Add to contacts
    const newContacts = new Set([...contacts, requesterId])
    setContacts(newContacts)
    localStorage.setItem("p2p-contacts", JSON.stringify([...newContacts]))

    // Remove from requests
    setContactRequests((prev) => prev.filter((req) => req.sender !== requesterId))
  }

  // Connect to peer by ID
  const connectToPeer = async (peerId: string): Promise<boolean> => {
    if (!p2pServiceRef.current) return false
    return p2pServiceRef.current.connectViaPeerId(peerId)
  }

  // Get messages for conversation
  const getMessages = (conversationId: string): P2PMessage[] => {
    return messages.get(conversationId) || []
  }

  // Get mutual contacts (users who are both discovered and in contacts)
  const getMutualContacts = (): P2PUser[] => {
    return discoveredUsers.filter((user) => contacts.has(user.id))
  }

  return {
    isConnected,
    peerId,
    discoveredUsers,
    connectedPeers,
    contactRequests,
    contacts: [...contacts],
    mutualContacts: getMutualContacts(),
    sendMessage,
    sendContactRequest,
    acceptContactRequest,
    connectToPeer,
    getMessages,
    addMessage,
  }
}
